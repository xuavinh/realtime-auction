import { create } from "zustand";

import {
    BidListItem,
} from "../types/bid.type";

type BidStore = {

    currentPrice: number;

    bids: BidListItem[];

    setCurrentPrice: (
        price: number
    ) => void;

    setBids: (
        bids: BidListItem[]
    ) => void;

    addBid: (
        bid: BidListItem
    ) => void;
};

export const useBidStore =
    create<BidStore>((set) => ({

        currentPrice: 0,

        bids: [],

        setCurrentPrice: (
            price
        ) =>
            set({
                currentPrice: price,
            }),

        setBids: (
            bids
        ) =>
            set({
                bids,
            }),

        addBid: (
            bid
        ) =>
            set((state) => ({

                currentPrice:
                    bid.bid_price,

                bids: [
                    bid,
                    ...state.bids,
                ],
            })),
    }));