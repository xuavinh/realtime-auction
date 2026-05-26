package actor

import (
	"bytes"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait   = 10 * time.Second
	pongWait    = 60 * time.Second
	pingPeriod  = 30 * time.Second
	maxMsgSize  = 256
	sendBufSize = 16
)

type Client struct {
	AuctionID int32
	UserID    int32
	UserName  string
	conn      *websocket.Conn
	send      chan []byte
	actor     *AuctionActor
}

func NewClient(auctionID, userID int32, userName string, conn *websocket.Conn, a *AuctionActor) *Client {
	return &Client{
		AuctionID: auctionID,
		UserID:    userID,
		UserName:  userName,
		conn:      conn,
		send:      make(chan []byte, sendBufSize),
		actor:     a,
	}
}

func (c *Client) readPump() {
	defer func() {
		c.actor.Send(UnregisterClientMsg{Client: c})
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMsgSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, msg, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
		if isSyncRequest(msg) {
			c.actor.Send(SyncRequestMsg{Client: c})
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case msg, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func isSyncRequest(msg []byte) bool {
	return len(msg) > 0 && bytes.Contains(msg, []byte(`"SYNC"`))
}
