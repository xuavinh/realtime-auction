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
	UserID     int32
	AuctionID  int32
	FileHeader *multipart.FileHeader
	File       multipart.File
	Ext        string
	MIME       string
}

type imageService interface {
	Create(ctx context.Context, userID int32, in service.CreateImageInput) (dto.AuctionImageItem, error)
	Delete(ctx context.Context, userID, auctionID, imageID int32) (string, error)
}

type AuctionImageHandler struct {
	svc       imageService
	uploadDir string
	publicURL string
}

func NewAuctionImageHandler(svc imageService, uploadDir, publicURL string) *AuctionImageHandler {
	return &AuctionImageHandler{
		svc:       svc,
		uploadDir: uploadDir,
		publicURL: strings.TrimRight(publicURL, "/"),
	}
}

func (h *AuctionImageHandler) Upload(c *gin.Context) {
	validated, ok := h.validateUpload(c)
	if !ok {
		return
	}
	defer validated.File.Close()

	dir := filepath.Join(h.uploadDir, strconv.Itoa(int(validated.AuctionID)))
	if err := os.MkdirAll(dir, 0o755); err != nil {
		utils.AbortError(c, http.StatusInternalServerError, "internal", "Failed to create upload directory")
		return
	}

	filename := uuid.NewString() + validated.Ext
	dstPath := filepath.Join(dir, filename)

	dst, err := os.OpenFile(dstPath, os.O_CREATE|os.O_WRONLY|os.O_EXCL, 0o644)
	if err != nil {
		utils.AbortError(c, http.StatusInternalServerError, "internal", "Failed to save uploaded image")
		return
	}
	defer dst.Close()

	written, err := io.Copy(dst, validated.File)
	if err != nil {
		_ = os.Remove(dstPath)
		utils.AbortError(c, http.StatusInternalServerError, "internal", "Failed to save uploaded image")
		return
	}
	if written > MaxImageBytes {
		_ = os.Remove(dstPath)
		utils.AbortError(c, http.StatusUnprocessableEntity, "image_too_large", "Maximum image size is 5MB")
		return
	}
	if err := dst.Sync(); err != nil {
		_ = os.Remove(dstPath)
		utils.AbortError(c, http.StatusInternalServerError, "internal", "Failed to save uploaded image")
		return
	}

	publicURL := fmt.Sprintf("%s/%d/%s", h.publicURL, validated.AuctionID, filename)

	resp, err := h.svc.Create(c.Request.Context(), validated.UserID, service.CreateImageInput{
		AuctionID: validated.AuctionID,
		URL:       publicURL,
		Filename:  validated.FileHeader.Filename,
		SizeBytes: int32(written),
		MimeType:  validated.MIME,
	})
	if err != nil {
		_ = os.Remove(dstPath)
		utils.AbortAppError(c, err)
		return
	}

	utils.SuccessData(c, http.StatusCreated, resp)
}

func (h *AuctionImageHandler) Delete(c *gin.Context) {
	uid, auctionID, ok := authUserAndAuctionID(c)
	if !ok {
		return
	}

	imgIDStr := c.Param("image_id")
	imgIDInt, err := strconv.ParseInt(imgIDStr, 10, 32)
	if err != nil || imgIDInt <= 0 {
		utils.AbortError(c, http.StatusBadRequest, "invalid_request", "Invalid image_id")
		return
	}
	imageID := int32(imgIDInt)

	urlForCleanup, err := h.svc.Delete(c.Request.Context(), uid, auctionID, imageID)
	if err != nil {
		utils.AbortAppError(c, err)
		return
	}

	if urlForCleanup != "" {
		rel := strings.TrimPrefix(urlForCleanup, h.publicURL)
		rel = strings.TrimPrefix(rel, "/")
		_ = os.Remove(filepath.Join(h.uploadDir, filepath.FromSlash(rel)))
	}

	utils.SuccessMessage(c, http.StatusOK, "Image deleted successfully")
}

func (h *AuctionImageHandler) validateUpload(c *gin.Context) (*validatedUpload, bool) {
	uid, auctionID, ok := authUserAndAuctionID(c)
	if !ok {
		return nil, false
	}

	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxImageBytes+1024)

	fileHeader, err := c.FormFile("file")
	if err != nil {
		utils.AbortError(c, http.StatusBadRequest, "invalid_request", "Please attach an image file in field 'file'")
		return nil, false
	}
	if fileHeader.Size > MaxImageBytes {
		utils.AbortError(c, http.StatusUnprocessableEntity, "image_too_large", "Maximum image size is 5MB")
		return nil, false
	}

	src, err := fileHeader.Open()
	if err != nil {
		utils.AbortError(c, http.StatusInternalServerError, "internal", "Failed to read uploaded file")
		return nil, false
	}

	head := make([]byte, 512)
	n, err := io.ReadFull(src, head)
	if err != nil && err != io.ErrUnexpectedEOF && err != io.EOF {
		_ = src.Close()
		utils.AbortError(c, http.StatusBadRequest, "invalid_image", "Invalid image file")
		return nil, false
	}
	if n == 0 {
		_ = src.Close()
		utils.AbortError(c, http.StatusBadRequest, "invalid_image", "Invalid image file")
		return nil, false
	}

	mime := http.DetectContentType(head[:n])
	ext, allowed := allowedMIMEs[mime]
	if !allowed {
		_ = src.Close()
		utils.AbortError(c, http.StatusUnprocessableEntity, "invalid_image_type", "Only JPEG and PNG images are allowed")
		return nil, false
	}

	if _, err := src.Seek(0, io.SeekStart); err != nil {
		_ = src.Close()
		utils.AbortError(c, http.StatusInternalServerError, "internal", "Failed to process uploaded image")
		return nil, false
	}

	cfg, _, err := image.DecodeConfig(src)
	if err != nil {
		_ = src.Close()
		utils.AbortError(c, http.StatusUnprocessableEntity, "invalid_image", "Uploaded file is not a valid image")
		return nil, false
	}
	if cfg.Width <= 0 || cfg.Height <= 0 {
		_ = src.Close()
		utils.AbortError(c, http.StatusUnprocessableEntity, "invalid_image", "Uploaded file is not a valid image")
		return nil, false
	}
	if cfg.Width > maxDimension || cfg.Height > maxDimension {
		_ = src.Close()
		utils.AbortError(c, http.StatusUnprocessableEntity, "image_dimensions_too_large", "Image dimensions are too large")
		return nil, false
	}

	if _, err := src.Seek(0, io.SeekStart); err != nil {
		_ = src.Close()
		utils.AbortError(c, http.StatusInternalServerError, "internal", "Failed to process uploaded image")
		return nil, false
	}

	return &validatedUpload{
		UserID:     uid,
		AuctionID:  auctionID,
		FileHeader: fileHeader,
		File:       src,
		Ext:        ext,
		MIME:       mime,
	}, true
}
