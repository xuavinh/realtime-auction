// AuctionCard.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./AuctionCard.module.css";

type AuctionCardProps = {
    id: string;
    title: string;
    image: string;
    currentPrice: number;
    endTime: string;
    startTime?: string;
    bidCount?: number;
    isLive?: boolean;
    status?: string;
    rawStartTime?: string;
    rawEndTime?: string;
};

function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

export default function AuctionCard({
    id,
    title,
    image,
    currentPrice,
    endTime,
    startTime,
    bidCount,
    isLive,
    status,
    rawStartTime,
    rawEndTime,
}: AuctionCardProps) {
    const [currentStatus, setCurrentStatus] = useState<string>(
        status ? status.toUpperCase() : (isLive ? "ACTIVE" : "")
    );

    // Đồng bộ trạng thái khi prop status thay đổi từ ngoài
    useEffect(() => {
        if (status) {
            setCurrentStatus(status.toUpperCase());
        }
    }, [status, isLive]);

    // Kiểm tra thời gian thực để chuyển đổi trạng thái giống backend
    useEffect(() => {
        if (currentStatus === "ENDED") return;

        const checkTime = () => {
            const now = new Date();
            
            if (currentStatus === "PENDING" && rawStartTime) {
                const start = new Date(rawStartTime);
                if (now >= start) {
                    setCurrentStatus("ACTIVE");
                }
            } else if (currentStatus === "ACTIVE" && rawEndTime) {
                const end = new Date(rawEndTime);
                if (now >= end) {
                    setCurrentStatus("ENDED");
                }
            }
        };

        checkTime();

        const interval = setInterval(checkTime, 1000);
        return () => clearInterval(interval);
    }, [currentStatus, rawStartTime, rawEndTime]);

    return (
        <Link href={`/auction/${id}`} className={styles.card}>
            <div className={styles.imageWrap}>
                {currentStatus === "ACTIVE" && (
                    <div className={styles.liveBadge}>
                        <span className={styles.dot}></span>
                        LIVE
                    </div>
                )}
                {currentStatus === "PENDING" && (
                    <div className={styles.pendingBadge}>
                        SẮP DIỄN RA
                    </div>
                )}
                {currentStatus === "ENDED" && (
                    <div className={styles.endedBadge}>
                        ĐÃ KẾT THÚC
                    </div>
                )}

                {image ? (
                    <img src={image} alt={title} className={styles.image} />
                ) : (
                    <div className={styles.image}>No image</div>
                )}
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>

                <div className={styles.infoGrid}>
                    <div className={styles.infoBox}>
                        <span className={styles.label}>Giá hiện tại</span>
                        <p className={styles.price}>
                            {formatPrice(currentPrice)}
                        </p>
                    </div>

                    <div className={styles.infoBox}>
                        <span className={styles.label}>
                            {currentStatus === "PENDING" ? "Bắt đầu lúc" : "Kết thúc"}
                        </span>
                        <p className={styles.time} style={currentStatus === "ENDED" ? { color: "#6b7280" } : currentStatus === "PENDING" ? { color: "#d97706" } : {}}>
                            {currentStatus === "PENDING" ? (startTime || endTime) : endTime}
                        </p>
                    </div>
                </div>

                <div className={styles.footer}>
                    {bidCount !== undefined ? (
                        <p className={styles.bidCount}>
                            {bidCount} lượt trả giá
                        </p>
                    ) : (
                        <div />
                    )}

                    <span className={styles.action}>
                        Xem chi tiết →
                    </span>
                </div>
            </div>
        </Link>
    );
}