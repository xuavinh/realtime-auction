// AuctionCard.tsx
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
}: AuctionCardProps) {
    // Xác định trạng thái hiển thị
    const currentStatus = status ? status.toUpperCase() : (isLive ? "ACTIVE" : "");

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