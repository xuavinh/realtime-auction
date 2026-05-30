"use client";

import { Button } from "antd";
import Link from "next/link";
import { type Auction } from "../services/auction.service";

import styles from "./AuctionSidebar.module.css";

type Props = {
    auction: Auction;
    bidCount?: number;
    winner?: { name: string; price: number } | null;
};

export default function AuctionSidebar({ auction, bidCount = 0, winner }: Props) {
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

                {auction.status === "ENDED" ? (
                    <div style={{
                        marginTop: 15,
                        marginBottom: 15,
                        padding: "16px 20px",
                        background: "rgba(22, 163, 74, 0.08)",
                        border: "1px solid rgba(22, 163, 74, 0.3)",
                        borderRadius: 14,
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                        gap: 6
                    }}>
                        <h4 style={{ margin: 0, color: "#16a34a", fontSize: "16px", fontWeight: "bold" }}>
                            Đấu giá đã kết thúc!
                        </h4>
                        {auction.winner_id && winner ? (
                            <p style={{ margin: 0, fontSize: "15px", color: "#1f2937", lineHeight: "1.6" }}>
                                Người thắng cuộc: <strong style={{ color: "#16a34a" }}>{winner.name}</strong>
                                <br />
                                Với mức giá: <strong style={{ color: "#2563eb" }}>{winner.price.toLocaleString("vi-VN")} đ</strong>
                            </p>
                        ) : (
                            <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                                Không có lượt đặt thầu hợp lệ nào cho phiên này.
                            </p>
                        )}
                    </div>
                ) : (
                    <Link href={`/auction/${auction.id}/bid`}>
                        <Button type="primary" block>
                            Đặt giá thầu
                        </Button>
                    </Link>
                )}

                <div className={styles.bidHistory}>
                    <p>{bidCount} lượt đấu giá</p>
                </div>
            </div>
        </div>
    );
}