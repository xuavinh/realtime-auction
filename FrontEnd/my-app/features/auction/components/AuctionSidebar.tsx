"use client";

import { Button } from "antd";
import Link from "next/link";
import { type Auction } from "../services/auction.service";

import styles from "./AuctionSidebar.module.css";

type Props = {
    auction: Auction;
    bidCount?: number;
};

export default function AuctionSidebar({ auction, bidCount = 0 }: Props) {
    const currentPrice = auction.current_price;

    return (
        <div className={styles.productBox}>
            <div className={styles.productInfo}>
                <h2>{auction.title}</h2>
                <p className={styles.start_time}>
                    Bắt đầu: {new Date(auction.start_time).toLocaleString("vi-VN")}
                </p>
                <p className={styles.end_time}>
                    Kết thúc:{" "}
                    {new Date(auction.end_time).toLocaleString("vi-VN")}
                </p>

                <Button type="primary" block>
                    + Thêm vào danh sách theo dõi
                </Button>
            </div>

            <div className={styles.bidSection}>
                <h3>Giá hiện tại</h3>

                <p className={styles.currentPrice}>
                    {currentPrice.toLocaleString("vi-VN")} đ
                </p>

                <p className={styles.minbid}>
                    Giá đặt thầu tối thiểu: {auction.min_bid_increment.toLocaleString("vi-VN")} đ
                </p>

                <Link href={`/auction/${auction.id}/bid`}>
                    <Button type="primary" block>
                        Đặt giá thầu
                    </Button>
                </Link>

                <div className={styles.bidHistory}>
                    <p>{bidCount} lượt đấu giá</p>
                </div>
            </div>
        </div>
    );
}