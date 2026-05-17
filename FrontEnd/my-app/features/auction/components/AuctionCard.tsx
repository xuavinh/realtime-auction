// AuctionCard.tsx
import Link from "next/link";
import styles from "./AuctionCard.module.css";

type AuctionCardProps = {
    id: string;
    title: string;
    image: string;
    currentPrice: number;
    endTime: string;
    bidCount: number;
    isLive?: boolean;
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
    bidCount,
    isLive = true,
}: AuctionCardProps) {
    return (
        <Link href={`/auction/${id}`} className={styles.card}>
            <div className={styles.imageWrap}>
                {isLive && (
                    <div className={styles.liveBadge}>
                        <span className={styles.dot}></span>
                        LIVE
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
                        <span className={styles.label}>Kết thúc</span>
                        <p className={styles.time}>{endTime}</p>
                    </div>
                </div>

                <div className={styles.footer}>
                    <p className={styles.bidCount}>
                        {bidCount} lượt trả giá
                    </p>

                    <span className={styles.action}>
                        Xem chi tiết →
                    </span>
                </div>
            </div>
        </Link>
    );
}