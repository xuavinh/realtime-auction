"use client";

import { useEffect } from "react";

import { listAuctionBids } from "@/features/auction/services/auction.service";
import { useAuctionSocket } from "./useAuctionSocket";

import { useBidStore } from "../store/bid.store";

export function useBidHistory(
    auctionId: number
) {
    const bids = useBidStore((s) => s.bids);
    const setBids =
        useBidStore((s) => s.setBids);
    const addBid =
        useBidStore((s) => s.addBid);

    // Fetch initial bids
    useEffect(() => {
        const fetchBids = async () => {
            try {
                const response =
                    await listAuctionBids(
                        auctionId,
                        1,
                        50
                    );
                if (response && response.data) {
                    setBids(response.data);
                }
            } catch (error) {
                console.error(
                    "Error fetching bids:",
                    error
                );
            }
        };

        fetchBids();
    }, [auctionId, setBids]);

    // Connect to WebSocket for real-time updates
    useAuctionSocket(
        auctionId,
        addBid
    );

    return { bids, setBids, addBid };
}