"use client";

import { useBidStore } from "../store/bid.store";

type Props = {
    auctionId: number;
};

export default function BidHistory({
    auctionId,
}: Props) {
    const bids = useBidStore(
        (state) => state.bids
    );

    return (
        <div>
            <h2>Lịch sử đấu giá</h2>

            {Array.isArray(bids) &&
                bids.map((bid) => (
                    <div key={bid.id}>
                        <p>
                            {
                                bid.bidder_name
                            }
                        </p>

                        <p>
                            {bid.bid_price.toLocaleString(
                                "vi-VN"
                            )}{" "}
                            đ
                        </p>
                    </div>
                ))}
        </div>
    );
}