"use client";

import { useEffect, useRef } from "react";
import { BidListItem } from "../types/bid.type";

interface WebSocketMessage {
    type: string;
    bid?: BidListItem;
    current_price?: number;
    new_price?: number;
    version?: number;
    end_time?: string;
    error?: string;
}

export function useAuctionSocket(
    auctionId: number,
    onNewBid?: (bid: BidListItem) => void
) {
    // Sử dụng ref cho callback để tránh việc reconnect khi hàm thay đổi
    const onNewBidRef = useRef(onNewBid);
    useEffect(() => {
        onNewBidRef.current = onNewBid;
    }, [onNewBid]);

    useEffect(() => {
        const token =
            typeof window !== "undefined"
                ? localStorage.getItem(
                    "access_token"
                )
                : null;

        if (!token) {
            console.warn(
                "No token available for WebSocket connection"
            );
            return;
        }

        const wsUrl = `${process.env
            .NEXT_PUBLIC_WS_URL
            }/ws/auctions/${auctionId
            }?token=${token}`;

        const ws = new WebSocket(
            wsUrl
        );
        let reconnectAttempts = 0;
        const maxReconnectAttempts =
            5;
        let reconnectTimer:
            | NodeJS.Timeout
            | null = null;

        const connect = () => {
            ws.onopen = () => {
                console.log(
                    "[WS] Connected to auction",
                    auctionId
                );
                reconnectAttempts = 0;
            };

            ws.onmessage = (
                event
            ) => {
                try {
                    const message: WebSocketMessage =
                        JSON.parse(
                            event.data
                        );

                    console.log(
                        "[WS] Received:",
                        message
                    );

                    if (
                        message.type ===
                        "NEW_BID" &&
                        message.bid
                    ) {
                        onNewBidRef.current?.(message.bid);
                    } else if (
                        message.type ===
                        "SYNC"
                    ) {
                        console.log(
                            "[WS] Sync message received"
                        );
                    }
                } catch (
                error
                ) {
                    console.error(
                        "[WS] Error parsing message:",
                        error
                    );
                }
            };

            ws.onerror = (error) => {
                // Trình duyệt bảo mật không tiết lộ chi tiết lỗi WebSocket (luôn là Event rỗng)
                console.warn(
                    `[WS] Kết nối WebSocket tới máy chủ đấu giá thất bại hoặc bị ngắt quãng (Có thể do Backend chưa chạy hoặc lỗi endpoint). URL: ${process.env.NEXT_PUBLIC_WS_URL}`
                );
            };

            ws.onclose = () => {
                console.log(
                    "[WS] Disconnected from auction",
                    auctionId
                );

                if (
                    reconnectAttempts <
                    maxReconnectAttempts
                ) {
                    const delay =
                        Math.pow(
                            2,
                            reconnectAttempts
                        ) *
                        1000;
                    reconnectTimer =
                        setTimeout(() => {
                            console.log(
                                "[WS] Attempting to reconnect..."
                            );
                            reconnectAttempts++;
                            connect();
                        }, delay);
                }
            };
        };

        connect();

        return () => {
            if (reconnectTimer) {
                clearTimeout(
                    reconnectTimer
                );
            }
            ws.close();
        };
    }, [auctionId]); // Chỉ phụ thuộc vào auctionId
}