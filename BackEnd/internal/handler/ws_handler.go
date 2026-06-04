package handler

import (
	"errors"
	"net/http"
	"sync"
	"xuanvinh/internal/actor"
	"xuanvinh/internal/middleware"
	"xuanvinh/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  256,
	WriteBufferSize: 256,
	WriteBufferPool: &sync.Pool{},
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WsHandler struct {
	registry *actor.ActorRegistry
}

func NewWsHandler(registry *actor.ActorRegistry) *WsHandler {
	return &WsHandler{registry: registry}
}

func (h *WsHandler) Upgrade(ctx *gin.Context) {
	auctionID, ok := parseAuctionID(ctx)
	if !ok {
		return
	}
	userID, ok := middleware.UserIDFrom(ctx)
	if !ok {
		utils.AbortError(ctx, http.StatusUnauthorized, "unauthorized", "Please sign in")
		return
	}
	userName, ok := ctx.Get(middleware.CtxFullName)
	if !ok {
		utils.AbortError(ctx, http.StatusUnauthorized, "unauthorized", "Please sign in")
		return
	}

	userNameStr, _ := userName.(string)

	a, err := h.registry.GetOrCreate(ctx.Request.Context(), auctionID)
	if err != nil {
		if errors.Is(err, actor.ErrAuctionAlreadyEnded) {
			utils.AbortError(ctx, http.StatusBadRequest, "auction_ended", "Auction has already ended")
			return
		}
		utils.AbortError(ctx, http.StatusNotFound, "auction_not_found", "Auction not found")
		return
	}

	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		return
	}

	client := actor.NewClient(auctionID, userID, userNameStr, conn, a)
	if !a.Send(actor.RegisterClientMsg{Client: client}) {
		conn.Close()
	}

}
