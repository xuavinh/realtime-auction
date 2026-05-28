"use client";

import { useEffect } from "react";

interface Props {
    auctionId: number;

    token: string;

    onMessage: (payload: any) => void;
}

export const useAuctionRealtime = ({
    auctionId,
    token,
    onMessage,
}: Props) => {
    useEffect(() => {
        if (!auctionId) return;

        const ws = new WebSocket(
            `${process.env.NEXT_PUBLIC_WS_URL}/ws/auctions/${auctionId}?token=${token}`
        );

        ws.onopen = () => {
            console.log("WS CONNECTED");
        };

        ws.onmessage = (event) => {
            const payload = JSON.parse(
                event.data
            );

            console.log(
                "WS MESSAGE",
                payload
            );

            onMessage(payload);
        };

        ws.onerror = (error) => {
            console.log(
                "WS ERROR",
                error
            );
        };

        ws.onclose = () => {
            console.log("WS CLOSED");
        };

        return () => {
            ws.close();
        };
    }, [auctionId, token]);
};