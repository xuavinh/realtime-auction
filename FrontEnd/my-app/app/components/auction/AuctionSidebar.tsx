"use client";

import { Button } from "antd";

import styles from "@/app/styles/auction.module.css";

export default function AuctionSidebar() {

    return (

        <div className={styles.productBox}>

            <div className={styles.productInfo}>

                <h2>
                    1 $Reserve Greenstone chỉ / PATU 329mm
                </h2>

                <p>
                    Đóng cửa: Thứ Bảy ngày 16 tháng Năm, 5:00 chiều
                </p>

                <Button type="primary" block>
                    + Thêm vào danh sách theo dõi
                </Button>

            </div>

            <div className={styles.bidSection}>

                <h3>Giá thầu hiện tại</h3>

                <p className={styles.currentPrice}>
                    $115.00
                </p>

                <Button type="primary" block>
                    Đặt giá thầu
                </Button>

                <div className={styles.bidHistory}>
                    <p>
                        20 giá thầu cho đến nay
                    </p>
                </div>

                <div className={styles.shipping}>
                    🚚 Phí vận chuyển: $20.00
                </div>

            </div>

        </div>
    );
}