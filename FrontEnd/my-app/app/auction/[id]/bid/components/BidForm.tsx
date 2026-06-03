"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import { useCountdown } from "../hooks/useCountdown";
import styles from "./BidForm.module.css";

export interface BidHistoryItem {
    id: number;
    bidder_name: string;
    bid_price: number;
    created_at: string;
}

export interface AuctionData {
    id: number;
    title: string;
    image: string;
    current_price: number;
    min_bid_increment: number;
    start_time: string;
    end_time: string;
    status: string;
    winner_id?: number | null;
}

type Props = {
    auction: AuctionData;
    bids: BidHistoryItem[];
    onPlaceBid?: (amount: number) => Promise<void>;
};

export default function AuctionBidLayout({
    auction,
    bids,
    onPlaceBid,
}: Props) {
    const [amount, setAmount] = useState<number>(auction.min_bid_increment);
    const [loading, setLoading] = useState(false);
    const [priceAnimate, setPriceAnimate] = useState(false);
    const [bidSuccessGlow, setBidSuccessGlow] = useState(false);
    const [showWinnerPopup, setShowWinnerPopup] = useState(false);
    const [hasTriggeredPopup, setHasTriggeredPopup] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

    // Tự động chuyển trạng thái PENDING sang ACTIVE trong thời gian thực khi đếm ngược bắt đầu chạm 0
    const { isEnded: isStarted } = useCountdown(auction.start_time);
    const [currentStatus, setCurrentStatus] = useState<string>(auction.status);

    useEffect(() => {
        setCurrentStatus(auction.status);
    }, [auction.status]);

    useEffect(() => {
        if (currentStatus === "PENDING" && isStarted) {
            setCurrentStatus("ACTIVE");
        }
    }, [isStarted, currentStatus]);

    // Live Chat
    const [chatMessages, setChatMessages] = useState<{ id: number; name: string; text: string; time: string }[]>([]);
    const [newMsg, setNewMsg] = useState("");

    // Lắng nghe sự kiện cuộn trang để kích hoạt Widget đếm ngược lơ lửng góc phải
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 120) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Kích hoạt hiệu ứng nhấp nháy và phóng to nhẹ khi giá thay đổi (Real-time update)
    useEffect(() => {
        if (auction.current_price > 0) {
            setPriceAnimate(true);
            const timer = setTimeout(() => setPriceAnimate(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [auction.current_price]);

    // Đồng bộ lượng đặt thầu tối thiểu khi dữ liệu đấu giá tải thành công từ API
    useEffect(() => {
        if (auction.min_bid_increment > 0) {
            setAmount(auction.min_bid_increment);
        }
    }, [auction.min_bid_increment]);


    // Tính toán các mốc cộng thêm nhanh thông minh dựa trên mức tăng tối thiểu
    const quickIncrements = useMemo(() => {
        const base = auction.min_bid_increment;
        return [
            { label: `+ ${(base).toLocaleString("vi-VN")} đ`, value: base },
            { label: `+ ${(base * 2).toLocaleString("vi-VN")} đ`, value: base * 2 },
            { label: `+ ${(base * 5).toLocaleString("vi-VN")} đ`, value: base * 5 },
            { label: `+ ${(base * 10).toLocaleString("vi-VN")} đ`, value: base * 10 },
        ];
    }, [auction.min_bid_increment]);

    const finalPrice = useMemo(() => {
        return auction.current_price + amount;
    }, [auction.current_price, amount]);

    const handleQuickSelect = (value: number) => {
        setAmount(value);
    };

    const handleSendChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMsg.trim()) return;

        setChatMessages(prev => [
            {
                id: Date.now(),
                name: "Bạn (Tôi)",
                text: newMsg.trim(),
                time: "vừa xong"
            },
            ...prev
        ]);
        setNewMsg("");
    };

    const handleSubmit = async () => {
        if (amount < auction.min_bid_increment) {
            return;
        }

        try {
            setLoading(true);
            await onPlaceBid?.(finalPrice);

            // Kích hoạt hiệu ứng thành công
            setBidSuccessGlow(true);
            setTimeout(() => setBidSuccessGlow(false), 2000);

            // Reset số tiền đặt về mức tối thiểu
            setAmount(auction.min_bid_increment);
        } finally {
            setLoading(false);
        }
    };

    // Tìm người dẫn đầu (giá thầu cao nhất)
    const highestBid = useMemo(() => {
        if (!bids || bids.length === 0) return null;
        return bids[0]; // Bids được sắp xếp giảm dần/mới nhất ở đầu
    }, [bids]);

    // Sử dụng countdown để phát hiện thời điểm kết thúc phiên đấu giá
    const { isEnded } = useCountdown(auction.end_time);

    // Kích hoạt hiển thị popup người chiến thắng ngay khi phiên kết thúc
    useEffect(() => {
        if ((isEnded || currentStatus === "ENDED") && !hasTriggeredPopup) {
            setShowWinnerPopup(true);
            setHasTriggeredPopup(true);
        }
    }, [isEnded, currentStatus, hasTriggeredPopup]);

    return (
        <div className={styles.container}>
            {/* Header / Trạng thái */}
            <div className={styles.header}>
                <div className={styles.headerTitleSec}>
                    <div className={styles.liveBadgeContainer}>
                        <span className={styles.livePingOuter}>
                            <span className={styles.livePing}></span>
                            <span className={styles.liveDot}></span>
                        </span>
                        <span className={styles.liveBadgeText}>
                            Đấu giá trực tiếp
                        </span>
                    </div>
                    <h1 className={styles.mainTitle}>
                        {auction.title}
                    </h1>
                </div>

                {/* Khối Đếm ngược tĩnh */}
                <div className={styles.countdownSec}>
                    <CountdownTimer startTime={auction.start_time} endTime={auction.end_time} status={currentStatus} />
                </div>
            </div>

            {/* Bố cục Grid 2 cột bằng nhau hoàn mỹ */}
            <div className={styles.mainGrid}>

                {/* CỘT TRÁI (Sản phẩm & Khung Chat) */}
                <div className={styles.leftCol}>

                    {/* Card Hình ảnh & Mô tả */}
                    <div className={styles.productCard}>
                        {auction.image ? (
                            <div className={styles.productImgSec}>
                                <img
                                    src={auction.image}
                                    alt={auction.title}
                                    className={styles.productImg}
                                />

                                {/* Badge Đang hoạt động trên hình ảnh */}
                                <div className={styles.activeBadgeOnImg}>
                                    <span className={styles.activeBadgeDot}></span>
                                    Kết nối trực tiếp
                                </div>
                            </div>
                        ) : (
                            <div className={styles.productImgEmpty}>
                                <i className="fa-solid fa-image text-3xl"></i>
                                <span className="text-sm">Đang tải hình ảnh sản phẩm...</span>
                            </div>
                        )}

                        <div className={styles.productInfoSec}>
                            <h3 className={styles.productInfoTitle}>
                                <i className="fa-solid fa-circle-info text-amber-500"></i>
                                Thông tin tài sản đấu giá
                            </h3>
                            <p className={styles.productInfoDesc}>
                                Tài sản đấu giá được kiểm định nghiêm ngặt về chất lượng, nguồn gốc xuất xứ rõ ràng và đảm bảo đầy đủ thủ tục pháp lý. Người chiến thắng sẽ nhận được chứng thư đấu giá chính thức cùng các tài liệu đi kèm từ ban tổ chức.
                            </p>
                        </div>
                    </div>

                    {/* Khung Chat Trực Tiếp */}
                    <div className={styles.chatBox}>
                        <div className={styles.chatHeader}>
                            <h3 className={styles.chatTitle}>
                                <i className="fa-solid fa-comments text-amber-500 animate-bounce"></i>
                                Trò chuyện trực tiếp
                            </h3>
                            <span className={styles.chatViewers}>
                                <span className={styles.chatViewersPing}></span>
                                0 người xem
                            </span>
                        </div>

                        {/* Danh sách tin nhắn chat */}
                        <div className={styles.chatList}>
                            {chatMessages.map((msg) => {
                                const isMe = msg.name === "Bạn (Tôi)";
                                return (
                                    <div
                                        key={msg.id}
                                        className={`${styles.chatMessage} ${isMe ? styles.chatMessageMe : ""
                                            }`}
                                    >
                                        <div className="flex items-center gap-1.5 mb-0.5 justify-start">
                                            <span className={`${styles.chatMsgSender} ${isMe ? styles.chatMsgSenderMe : ""}`}>
                                                {msg.name}
                                            </span>
                                            <span className={styles.chatMsgTime}>
                                                {msg.time}
                                            </span>
                                        </div>
                                        <p className={`${styles.chatMsgText} ${isMe ? styles.chatMsgTextMe : ""}`}>
                                            {msg.text}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input chat */}
                        <form onSubmit={handleSendChat} className={styles.chatForm}>
                            <input
                                type="text"
                                value={newMsg}
                                onChange={(e) => setNewMsg(e.target.value)}
                                placeholder="Nhập bình luận của bạn..."
                                className={styles.chatInput}
                            />
                            <button
                                type="submit"
                                className={styles.chatSubmit}
                            >
                                <i className="fa-solid fa-paper-plane"></i>
                            </button>
                        </form>
                    </div>
                </div>

                {/* CỘT PHẢI */}
                <div className={styles.rightCol}>

                    {/* BẢNG ĐIỀU KHIỂN ĐẶT GIÁ (Interactive Bid Console) */}
                    <div className={`${styles.consoleCard} ${bidSuccessGlow ? styles.consoleCardSuccess : ""
                        }`}>
                        {/* Banner Người Chiến Thắng khi đấu giá kết thúc */}
                        {currentStatus === "ENDED" && (
                            <div className={styles.endedBanner}>
                                <h4 className={styles.endedBannerTitle}>
                                    <i className="fa-solid fa-trophy text-amber-400 animate-bounce"></i>
                                    PHIÊN ĐẤU GIÁ ĐÃ KẾT THÚC
                                </h4>
                                {highestBid ? (
                                    <div className={styles.endedBannerBody}>
                                        <p className={styles.endedBannerText}>
                                            Chúc mừng người chiến thắng: <strong className="text-emerald-400 font-bold">{highestBid.bidder_name}</strong> với mức giá cuối cùng là <strong className="text-amber-400 font-bold font-mono text-sm">{highestBid.bid_price.toLocaleString("vi-VN")} đ</strong>!
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setShowWinnerPopup(true)}
                                            className={styles.btnViewCelebration}
                                        >
                                            <i className="fa-solid fa-trophy"></i> Xem vinh danh chiến thắng
                                        </button>
                                    </div>
                                ) : (
                                    <p className={styles.endedBannerEmpty}>
                                        Không có lượt đặt thầu hợp lệ nào được ghi nhận cho phiên đấu giá này.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Section Giá hiện tại */}
                        <div className={styles.priceSection}>
                            <span className={styles.priceLabel}>
                                <i className="fa-solid fa-tag text-amber-500"></i>
                                Giá hiện tại
                            </span>

                            <div className={styles.priceValueSec}>
                                <h2 className={`${styles.priceValue} ${priceAnimate ? styles.priceValueAnimate : ""
                                    }`}>
                                    {auction.current_price.toLocaleString("vi-VN")}
                                </h2>
                                <span className="text-amber-500 font-bold text-base">đ</span>
                            </div>

                            {/* Show Người dẫn đầu nếu có */}
                            {highestBid && (
                                <div className={styles.leaderSection}>
                                    <span className={styles.leaderLabel}>
                                        <i className="fa-solid fa-crown text-amber-500"></i>
                                        Người dẫn đầu:
                                    </span>
                                    <span className={styles.leaderName}>
                                        {highestBid.bidder_name}
                                    </span>
                                </div>
                            )}
                        </div>

                        <hr className="border-slate-800/60 mb-4" />

                        {/* Bước nhảy tối thiểu */}
                        <div className={styles.minBidSection}>
                            <div>
                                <span className={styles.minBidTitle}>
                                    Mức tăng tối thiểu
                                </span>
                                <span className={styles.minBidPrice}>
                                    + {auction.min_bid_increment.toLocaleString("vi-VN")} đ
                                </span>
                            </div>
                            <div className={styles.minBidBadge}>
                                Thầu tiếp
                            </div>
                        </div>

                        {/* Chọn nhanh mức tăng */}
                        <div className={styles.quickBidSection}>
                            <span className={styles.quickBidLabel}>
                                Chọn nhanh lượng tăng thêm
                            </span>
                            <div className={styles.quickBidGrid}>
                                {quickIncrements.map((item, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={currentStatus !== "ACTIVE"}
                                        onClick={() => handleQuickSelect(item.value)}
                                        className={`${styles.quickBidBtn} ${currentStatus !== "ACTIVE"
                                            ? styles.quickBidBtnDisabled
                                            : amount === item.value
                                                ? styles.quickBidBtnActive
                                                : ""
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Nhập giá tùy chỉnh */}
                        <div className={styles.customBidSection}>
                            <label className={styles.customBidLabel}>
                                Hoặc nhập giá muốn tăng thêm
                            </label>
                            <div className={styles.customBidInputWrapper}>
                                <input
                                    type="number"
                                    disabled={currentStatus !== "ACTIVE"}
                                    min={auction.min_bid_increment}
                                    step={auction.min_bid_increment}
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className={`${styles.customBidInput} ${currentStatus !== "ACTIVE" ? styles.customBidInputDisabled : ""
                                        }`}
                                />
                                <div className={styles.customBidCurrency}>
                                    đ
                                </div>
                            </div>
                        </div>

                        {/* Giá sau khi đấu */}
                        <div className={styles.nextPriceSection}>
                            <span className={styles.nextPriceLabel}>
                                Giá đấu thầu tiếp theo của bạn
                            </span>
                            <div className={styles.nextPriceValueSec}>
                                <h3 className={styles.nextPriceValue}>
                                    {finalPrice.toLocaleString("vi-VN")}
                                </h3>
                                <span className={styles.nextPriceCurrency}>đ</span>
                            </div>
                        </div>

                        {/* NÚT ĐẶT GIÁ CHÍNH */}
                        <button
                            type="button"
                            disabled={loading || currentStatus !== "ACTIVE" || amount < auction.min_bid_increment}
                            onClick={handleSubmit}
                            className={`${styles.btnPlaceBid} ${loading || currentStatus !== "ACTIVE" || amount < auction.min_bid_increment
                                ? styles.btnPlaceBidDisabled
                                : ""
                                }`}
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                                    Đang truyền thầu...
                                </>
                            ) : currentStatus === "PENDING" ? (
                                <>
                                    <i className="fa-solid fa-hourglass-start"></i>
                                    Chờ phiên bắt đầu
                                </>
                            ) : currentStatus !== "ACTIVE" ? (
                                <>
                                    <i className="fa-solid fa-hourglass-end"></i>
                                    Đấu giá đã kết thúc
                                </>
                            ) : amount < auction.min_bid_increment ? (
                                <>
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                    Mức tăng không đủ
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-gavel"></i>
                                    Đặt giá thầu ngay
                                </>
                            )}
                        </button>
                    </div>

                    {/* BẢNG LỊCH SỬ ĐẤU GIÁ (Live Bid History Ledger) */}
                    <div className={styles.historyCard}>
                        <h3 className={styles.historyHeader}>
                            <i className="fa-solid fa-clock-rotate-left text-amber-500"></i>
                            Lịch sử đấu giá
                            <span className={styles.historyCount}>
                                {bids.length} lượt thầu
                            </span>
                        </h3>

                        {!Array.isArray(bids) || bids.length === 0 ? (
                            <div className={styles.historyEmpty}>
                                <i className="fa-solid fa-inbox text-2xl"></i>
                                <span className={styles.historyEmptyText}>Chưa có lượt đặt giá nào</span>
                                <span className={styles.historyEmptyDesc}>Hãy là người đặt giá đầu tiên cho tài sản này!</span>
                            </div>
                        ) : (
                            <div className={styles.historyList}>
                                {bids.map((bid, index) => {
                                    const isFirst = index === 0;
                                    return (
                                        <div
                                            key={bid.id}
                                            className={`${styles.historyItem} ${isFirst ? styles.historyItemLead : ""
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Icon Avatar */}
                                                <div className={`${styles.historyAvatar} ${isFirst ? styles.historyAvatarLead : ""
                                                    }`}>
                                                    {isFirst ? (
                                                        <i className="fa-solid fa-crown"></i>
                                                    ) : (
                                                        bid.bidder_name.slice(0, 1).toUpperCase()
                                                    )}
                                                </div>

                                                <div className={styles.historyBidderMeta}>
                                                    <div className={styles.historyBidderNameSec}>
                                                        <span className={`${styles.historyBidderName} ${isFirst ? styles.historyBidderNameLead : ""
                                                            }`}>
                                                            {bid.bidder_name}
                                                        </span>
                                                        {isFirst && (
                                                            <span className={styles.historyWinnerBadge}>
                                                                Dẫn đầu
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className={styles.historyTime}>
                                                        {new Date(bid.created_at).toLocaleString("vi-VN", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            second: "2-digit",
                                                            day: "2-digit",
                                                            month: "2-digit"
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={styles.historyPriceSec}>
                                                <span className={`${styles.historyPrice} ${isFirst ? styles.historyPriceLead : ""
                                                    }`}>
                                                    {bid.bid_price.toLocaleString("vi-VN")}
                                                </span>
                                                <span className={`${styles.historyCurrency} ${isFirst ? styles.historyCurrencyLead : ""
                                                    }`}>
                                                    đ
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {showWinnerPopup && (
                <div className={styles.winnerPopup}>
                    {/* Backdrop làm mờ */}
                    <div
                        className={styles.winnerPopupOverlay}
                        onClick={() => setShowWinnerPopup(false)}
                    ></div>

                    <div className={styles.winnerPopupDialog}>
                        <div className={styles.winnerPopupContent}>

                            <div className={styles.winnerPopupDecor}>
                                <div className={styles.winnerPopupDecorPing1}></div>
                                <div className={styles.winnerPopupDecorPing2}></div>
                                <div className={styles.winnerPopupDecorPing3}></div>
                            </div>

                            <button
                                type="button"
                                className={styles.winnerPopupClose}
                                onClick={() => setShowWinnerPopup(false)}
                            >
                                <i className="fa-solid fa-xmark text-base"></i>
                            </button>

                            <div className={styles.winnerPopupHeader}>
                                <div className={styles.winnerPopupTrophyWrapper}>
                                    <div className={styles.winnerPopupTrophyGlow}></div>
                                    <div className={styles.winnerPopupTrophy}>
                                        <i className="fa-solid fa-trophy text-amber-400 text-3xl animate-bounce"></i>
                                    </div>
                                </div>
                                <span className={styles.winnerPopupSubTitle}>
                                    Kết quả chung cuộc
                                </span>
                                <h2 className={styles.winnerPopupTitle}>
                                    Đấu giá hoàn thành!
                                </h2>
                            </div>

                            <div className={styles.winnerPopupBody}>
                                {highestBid ? (
                                    <div className={styles.winnerPopupCard}>

                                        {/* Avatar / Crown */}
                                        <div className={styles.winnerPopupCrownWrapper}>
                                            <div className={styles.winnerPopupCrown}>
                                                <i className="fa-solid fa-crown text-amber-400 text-xl"></i>
                                            </div>
                                        </div>

                                        <div className="space-y-0.5">
                                            <span className={styles.winnerPopupCardLabel}>
                                                Người thắng cuộc
                                            </span>
                                            <span className={styles.winnerPopupCardValue}>
                                                {highestBid.bidder_name}
                                            </span>
                                        </div>

                                        <div className={styles.winnerPopupCardDivider}></div>

                                        <div className="space-y-0.5">
                                            <span className={styles.winnerPopupCardLabel}>
                                                Mức giá chung cuộc
                                            </span>
                                            <span className={styles.winnerPopupPrice}>
                                                {highestBid.bid_price.toLocaleString("vi-VN")} <span className="text-xs text-amber-500 font-bold">đ</span>
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.winnerPopupEmptyCard}>
                                        <div className={styles.winnerPopupEmptyIcon}>
                                            <i className="fa-solid fa-inbox text-lg"></i>
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className={styles.winnerPopupEmptyLabel}>
                                                Không có người chiến thắng
                                            </span>
                                            <span className={styles.winnerPopupEmptyDesc}>
                                                Phiên kết thúc mà không có lượt đặt giá hợp lệ.
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.winnerPopupProductCard}>
                                    {auction.image && (
                                        <div className={styles.winnerPopupProductImgSec}>
                                            <img src={auction.image} alt={auction.title} className={styles.winnerPopupProductImg} />
                                        </div>
                                    )}
                                    <div className={styles.winnerPopupProductMeta}>
                                        <span className={styles.winnerPopupProductLabel}>
                                            Sản phẩm đấu giá
                                        </span>
                                        <span className={styles.winnerPopupProductTitle}>
                                            {auction.title}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowWinnerPopup(false)}
                                    className={styles.winnerPopupBtnAction}
                                >
                                    <i className="fa-solid fa-circle-check"></i> Quay lại phòng đấu giá
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`${styles.stickyCountdownWidget} ${isSticky ? styles.stickyCountdownVisible : ""}`}>
                <CountdownTimer startTime={auction.start_time} endTime={auction.end_time} status={currentStatus} />
            </div>
        </div>
    );
}
