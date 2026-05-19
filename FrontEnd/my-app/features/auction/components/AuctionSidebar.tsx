"use client";

import { useState } from "react";
import { Button, Modal, InputNumber, message, Space } from "antd";
import { type Auction } from "../services/auction.service";

import styles from "./AuctionSidebar.module.css";

type Props = {
    auction: Auction;
};

export default function AuctionSidebar({ auction }: Props) {
    const [open, setOpen] = useState(false);
    const [bidAmount, setBidAmount] = useState<number | null>(null);

    const currentPrice = auction.current_price;

    // ✅ lấy min bid từ backend
    const minIncrement = auction.min_bid_increment || 0;

    const suggestedPrice =
        currentPrice + (bidAmount ?? minIncrement);

    const handleSubmitBid = () => {
        if (!bidAmount || bidAmount <= 0) {
            message.error("Vui lòng nhập số tiền hợp lệ");
            return;
        }

        if (bidAmount < minIncrement) {
            message.error(
                `Mức tăng tối thiểu là ${minIncrement.toLocaleString("vi-VN")} đ`
            );
            return;
        }

        const finalPrice = currentPrice + bidAmount;

        // TODO: call API place bid
        console.log("PLACE BID:", finalPrice);

        message.success("Đặt giá thầu thành công!");
        setOpen(false);
        setBidAmount(null);
    };

    const quickAdd = (value: number) => {
        setBidAmount((prev) => (prev ?? 0) + value);
    };

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

                <Button type="primary" block onClick={() => setOpen(true)}>
                    Đặt giá thầu
                </Button>

                <div className={styles.bidHistory}>
                    <p>10 lượt đấu giá</p>
                </div>
            </div>

            {/* ===== BID MODAL ===== */}
            <Modal
                title="Đặt giá thầu"
                open={open}
                onCancel={() => setOpen(false)}
                onOk={handleSubmitBid}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <p>
                    Giá hiện tại:{" "}
                    <b>{currentPrice.toLocaleString("vi-VN")} đ</b>
                </p>

                <p>
                    Mức tăng tối thiểu:{" "}
                    <b>{minIncrement.toLocaleString("vi-VN")} đ</b>
                </p>

                <div style={{ margin: "12px 0" }}>
                    <p>Số tiền muốn tăng thêm:</p>

                    <InputNumber
                        style={{ width: "100%" }}
                        min={minIncrement}
                        step={minIncrement}
                        value={bidAmount}
                        onChange={(v) => setBidAmount(v)}
                        formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                    />
                </div>

                <p>
                    Giá sau khi đấu:{" "}
                    <b style={{ color: "#1890ff" }}>
                        {suggestedPrice.toLocaleString("vi-VN")} đ
                    </b>
                </p>

                <Space style={{ marginTop: 12 }}>
                    <Button onClick={() => quickAdd(minIncrement)}>
                        + Min
                    </Button>

                    <Button onClick={() => quickAdd(minIncrement * 2)}>
                        +2x Min
                    </Button>

                    <Button onClick={() => quickAdd(minIncrement * 5)}>
                        +5x Min
                    </Button>
                </Space>
            </Modal>
        </div>
    );
}