"use client";

import { Button } from "antd";
import { type Auction } from "../services/auction.service";

import styles from "./AuctionSidebar.module.css";

type Props = {
    auction: Auction;
};

export default function AuctionSidebar({
    auction,
}: Props) {

    return (

        <div className={styles.productBox}>

            <div className={styles.productInfo}>

                <h2>
                    {auction.title}
                </h2>

                <p>
                    Kết thúc:{" "}
                    {new Date(
                        auction.end_time
                    ).toLocaleString("vi-VN")}
                </p>

                <Button type="primary" block>
                    + Thêm vào danh sách theo dõi
                </Button>

            </div>

            <div className={styles.bidSection}>

                <h3>Giá thầu hiện tại</h3>

                <p className={styles.currentPrice}>
                    {auction.current_price.toLocaleString("vi-VN")} đ
                </p>

                <Button type="primary" block>
                    Đặt giá thầu
                </Button>

                <div className={styles.bidHistory}>
                    <p>
                        20 giá thầu cho đến nay
                    </p>
                </div>

                {/* <div className={styles.shipping}>
                    🚚 Phí vận chuyển: $20.00
                </div> */}

            </div>

        </div>
    );
}
