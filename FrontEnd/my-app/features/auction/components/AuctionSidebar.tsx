"use client";

import { Button } from "antd";
import Link from "next/link";
import { type Auction } from "../services/auction.service";

import styles from "./AuctionSidebar.module.css";

type Props = {
    auction: Auction;
};

export default function AuctionSidebar({ auction }: Props) {
    const currentPrice = auction.current_price;

    return (
        <div className={styles.productBox}>
            <div className={styles.productInfo}>
                <h2>{auction.title}</h2>

                <p>
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

                <Link href={`/auction/${auction.id}/bid`}>
                    <Button type="primary" block>
                        Đặt giá thầu
                    </Button>
                </Link>

                <div className={styles.bidHistory}>
                    <p>0 lượt đấu giá</p>
                </div>
            </div>
        </div>
    );
}