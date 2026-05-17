package handler

import (
	"context"
	"fmt"
	"image"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"xuanvinh/internal/dto"
	"xuanvinh/internal/middleware"
	"xuanvinh/internal/service"
	"xuanvinh/internal/utils"

	_ "image/jpeg"
	_ "image/png"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	MaxImageBytes int64 = 5 * 1024 * 1024 // 5MB
	maxDimension        = 8000
)

var allowedMIMEs = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
}

type validatedUpload struct {
	AuctionID  int32
	Status     string
	FileHeader *multipart.FileHeader
	File       multipart.File
	Ext        string
	MIME       string
}

type imageService interface {
	Create(ctx context.Context, in service.CreateImageInput) (dto.AuctionImageItem, error)
	Delete(ctx context.Context, auctionID, imageID int32, auctionStatus string) (string, error)
}

type AuctionImageHandler struct {
	svc       imageService
	uploadDir string
	publicURL string
}

func NewAuctionImageHandler(svc imageService, uploadDir string, publicURL string) *AuctionImageHandler {
	return &AuctionImageHandler{
		svc:       svc,
		uploadDir: uploadDir,
		publicURL: strings.TrimRight(publicURL, "/"),
	}
}

func (h *AuctionImageHandler) Upload(ctx *gin.Context) {
	validated, ok := h.validateUpload(ctx)
	if !ok {
		return
	}
	defer validated.File.Close()

	dir := filepath.Join(h.uploadDir, strconv.Itoa(int(validated.AuctionID)))

	if err := os.MkdirAll(dir, 0o755); err != nil {
		utils.AbortError(ctx, http.StatusInternalServerError, "internal", "Failed to create upload directory")
		return
	}

	filename := uuid.NewString() + validated.Ext
	dstPath := filepath.Join(dir, filename)

	dst, err := os.OpenFile(dstPath, os.O_CREATE|os.O_WRONLY|os.O_EXCL, 0o644)
	if err != nil {
		utils.AbortError(ctx, http.StatusInternalServerError, "internal", "Failed to save uploaded image")
		return
	}
	defer dst.Close()

	written, err := io.Copy(dst, validated.File)
	if err != nil {
		os.Remove(dstPath)
		utils.AbortError(ctx, http.StatusInternalServerError, "internal", "Failed to save uploaded image")
		return
	}

	if written > MaxImageBytes {
		os.Remove(dstPath)
		utils.AbortError(ctx, http.StatusUnprocessableEntity, "image_too_large", "Maximum image size is 5MB")
		return
	}

	//Force OS flush buffer xuống disk
	if err := dst.Sync(); err != nil {
		os.Remove(dstPath)
		utils.AbortError(ctx, http.StatusInternalServerError, "internal", "Failed to save uploaded image")
		return
	}

	publicURL := fmt.Sprintf(
		"%s/%d/%s",
		h.publicURL,
		validated.AuctionID,
		filename,
	)

	resp, err := h.svc.Create(ctx.Request.Context(), service.CreateImageInput{
		AuctionID:     validated.AuctionID,
		AuctionStatus: validated.Status,
		URL:           publicURL,
		Filename:      validated.FileHeader.Filename,
		SizeBytes:     int32(written),
		MimeType:      validated.MIME,
	})
	if err != nil {
		os.Remove(dstPath)
		utils.AbortAppError(ctx, err)
		return
	}

	utils.SuccessData(ctx, http.StatusCreated, resp)
}

func (h *AuctionImageHandler) Delete(c *gin.Context) {
	auctionID, ok := middleware.AuctionIDFrom(c)
	if !ok {
		utils.AbortError(c, http.StatusInternalServerError, "internal", "Please try again")
		return
	}
	status, ok := middleware.AuctionStatusFrom(c)
	if !ok {
		utils.AbortError(c, http.StatusInternalServerError, "internal", "Please try again")
		return
	}

	imgIDStr := c.Param("image_id")
	imgIDInt, err := strconv.ParseInt(imgIDStr, 10, 32)
	if err != nil || imgIDInt <= 0 {
		utils.AbortError(c, http.StatusBadRequest, "invalid_request", "Invalid image_id")
		return
	}
	imageID := int32(imgIDInt)

	urlForCleanup, err := h.svc.Delete(c.Request.Context(), auctionID, imageID, status)
	if err != nil {
		utils.AbortAppError(c, err)
		return
	}

	if urlForCleanup != "" {
		// urlForCleanup = "publicURL/auctionID/filename".
		rel := strings.TrimPrefix(urlForCleanup, h.publicURL)
		rel = strings.TrimPrefix(rel, "/")
		os.Remove(filepath.Join(h.uploadDir, filepath.FromSlash(rel)))
	}

	utils.SuccessMessage(c, http.StatusOK, "Image deleted successfully")
}

func (h *AuctionImageHandler) validateUpload(ctx *gin.Context) (*validatedUpload, bool) {
	auctionID, ok := middleware.AuctionIDFrom(ctx)
	if !ok {
		utils.AbortError(ctx, http.StatusInternalServerError, "internal", "Please try again")
		return nil, false
	}

	status, ok := middleware.AuctionStatusFrom(ctx)
	if !ok {
		utils.AbortError(ctx, http.StatusInternalServerError, "internal", "Please try again")
		return nil, false
	}

	ctx.Request.Body = http.MaxBytesReader(
		ctx.Writer,
		ctx.Request.Body,
		MaxImageBytes+1024,
	)

	fileHeader, err := ctx.FormFile("file")
	if err != nil {
		utils.AbortError(ctx, http.StatusBadRequest, "invalid_request", "Please attach an image file in field 'file'")
		return nil, false
	}

	if fileHeader.Size > MaxImageBytes {
		utils.AbortError(ctx, http.StatusUnprocessableEntity, "image_too_large", "Maximum image size is 5MB")
		return nil, false
	}

	src, err := fileHeader.Open()
	if err != nil {
		utils.AbortError(ctx, http.StatusInternalServerError, "internal", "Failed to read uploaded file")
		return nil, false
	}

	head := make([]byte, 512)

	n, err := io.ReadFull(src, head)
	if err != nil && err != io.ErrUnexpectedEOF && err != io.EOF {
		src.Close()
		utils.AbortError(ctx, http.StatusBadRequest, "invalid_image", "Invalid image file")
		return nil, false
	}
	if n == 0 {
		src.Close()
		utils.AbortError(ctx, http.StatusBadRequest, "invalid_image", "Invalid image file")
		return nil, false
	}

	mime := http.DetectContentType(head[:n])

	ext, allowed := allowedMIMEs[mime]
	if !allowed {
		src.Close()
		utils.AbortError(ctx, http.StatusUnprocessableEntity, "invalid_image_type", "Only JPEG and PNG images are allowed")
		return nil, false
	}

	if _, err := src.Seek(0, io.SeekStart); err != nil {
		src.Close()
		utils.AbortError(ctx, http.StatusInternalServerError, "internal", "Failed to process uploaded image")
		return nil, false
	}

	cfg, _, err := image.DecodeConfig(src)
	if err != nil {
		src.Close()
		utils.AbortError(ctx, http.StatusUnprocessableEntity, "invalid_image", "Uploaded file is not a valid image")
		return nil, false
	}

	if cfg.Width <= 0 || cfg.Height <= 0 {
		src.Close()
		utils.AbortError(ctx, http.StatusUnprocessableEntity, "invalid_image", "Uploaded file is not a valid image")
		return nil, false
	}

	if cfg.Width > maxDimension || cfg.Height > maxDimension {
		src.Close()
		utils.AbortError(ctx, http.StatusUnprocessableEntity, "image_dimensions_too_large", "Image dimensions are too large")
		return nil, false
	}

	if _, err := src.Seek(0, io.SeekStart); err != nil {
		src.Close()
		utils.AbortError(ctx, http.StatusInternalServerError, "internal", "Failed to process uploaded image")
		return nil, false
	}

	return &validatedUpload{
		AuctionID:  auctionID,
		Status:     status,
		FileHeader: fileHeader,
		File:       src,
		Ext:        ext,
		MIME:       mime,
	}, true
}
