"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import CountdownTimer from "./CountdownTimer";

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

    // Live Chat giả lập
    const [chatMessages, setChatMessages] = useState([
        { id: 1, name: "Thành Nam", text: "Sản phẩm này nhìn tinh xảo thật đấy! Đáng đồng tiền bát gạo.", time: "vừa xong" },
        { id: 2, name: "Minh Quân", text: "Giá khởi điểm cực kỳ hời so với giá thị trường hiện tại.", time: "1 phút trước" },
        { id: 3, name: "Hoàng Yến", text: "Hi vọng mình sẽ may mắn thắng được phiên đấu giá này.", time: "2 phút trước" },
        { id: 4, name: "Quốc Đạt", text: "Minh Quân định bid thêm bao nhiêu thế? Tôi theo tới cùng!", time: "3 phút trước" }
    ]);
    const [newMsg, setNewMsg] = useState("");

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

    // Giả lập tin nhắn chat ngẫu nhiên của cộng đồng mỗi 12 giây
    useEffect(() => {
        const sampleChats = [
            { name: "Đăng Khoa", text: "Quá đẹp! Tiếc là vượt ngân sách của mình rồi." },
            { name: "Khánh Linh", text: "Mức tăng tối thiểu rất hợp lý, cuộc chiến này gay cấn đây!" },
            { name: "Tuấn Tú", text: "Ai là người dẫn đầu thế kia? Đỉnh quá." },
            { name: "Ngọc Mai", text: "Đợi 10 giây cuối cùng rồi mình sẽ úp sọt, haha!" },
            { name: "Hữu Nghĩa", text: "Sản phẩm có kèm hộp đựng và giấy tờ kiểm định đầy đủ không chủ phòng?" },
            { name: "Phương Thảo", text: "Giá thầu nhảy liên tục, nhìn phấn khích ghê!" },
            { name: "Mạnh Hùng", text: "Lần đầu tham gia sàn này, giao diện nhìn chuyên nghiệp thật." }
        ];

        const chatTimer = setInterval(() => {
            const randomChat = sampleChats[Math.floor(Math.random() * sampleChats.length)];
            setChatMessages(prev => [
                {
                    id: Date.now(),
                    name: randomChat.name,
                    text: randomChat.text,
                    time: "vừa xong"
                },
                ...prev.slice(0, 15) // Giới hạn tối đa 15 tin nhắn hiển thị để tránh lag
            ]);
        }, 12000);

        return () => clearInterval(chatTimer);
    }, []);

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

    return (
        <div className="bg-[#090d16] text-zinc-100 min-h-screen py-6 px-4 md:px-8 font-sans transition-all duration-500">
            {/* Header / Trạng thái */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
                <div>
                    <div className="flex items-center gap-2.5 mb-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <span className="text-red-500 font-extrabold uppercase tracking-widest text-xs animate-pulse">
                            Đấu giá trực tiếp
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                        {auction.title}
                    </h1>
                </div>

                {/* Khối Đếm ngược */}
                <div className="bg-[#0f172a]/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md self-start md:self-auto">
                    <CountdownTimer startTime={auction.start_time} endTime={auction.end_time} status={auction.status} />
                </div>
            </div>

            {/* Bố cục Grid 2 cột bằng nhau hoàn mỹ */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* CỘT TRÁI (Sản phẩm & Khung Chat) */}
                <div className="flex flex-col gap-8">
                    
                    {/* Card Hình ảnh & Mô tả */}
                    <div className="bg-[#0f172a]/40 border border-slate-800/80 rounded-3xl overflow-hidden hover:border-slate-700/80 transition-all duration-300 shadow-2xl backdrop-blur-md">
                        {auction.image ? (
                            <div className="relative w-full h-[300px] md:h-[380px] bg-[#070b12] group border-b border-slate-900 flex items-center justify-center overflow-hidden">
                                <img
                                    src={auction.image}
                                    alt={auction.title}
                                    className="max-w-full max-h-full object-contain p-4 transition-transform duration-500 group-hover:scale-102"
                                />
                                
                                {/* Badge Đang hoạt động trên hình ảnh */}
                                <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-slate-800/60 flex items-center gap-1.5 shadow-lg">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Kết nối trực tiếp
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-[300px] md:h-[380px] bg-[#070b12] border-b border-slate-900 flex flex-col items-center justify-center text-slate-500 gap-2">
                                <i className="fa-solid fa-image text-3xl"></i>
                                <span className="text-sm">Đang tải hình ảnh sản phẩm...</span>
                            </div>
                        )}

                        <div className="p-6">
                            <h3 className="text-base font-bold mb-2 text-slate-200 flex items-center gap-2">
                                <i className="fa-solid fa-circle-info text-amber-500"></i>
                                Thông tin tài sản đấu giá
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Tài sản đấu giá được kiểm định nghiêm ngặt về chất lượng, nguồn gốc xuất xứ rõ ràng và đảm bảo đầy đủ thủ tục pháp lý. Người chiến thắng sẽ nhận được chứng thư đấu giá chính thức cùng các tài liệu đi kèm từ ban tổ chức.
                            </p>
                        </div>
                    </div>

                    {/* Khung Chat Trực Tiếp (Live Chat Arena) */}
                    <div className="bg-[#0f172a]/40 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col h-[350px] backdrop-blur-md">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <i className="fa-solid fa-comments text-amber-500 animate-bounce"></i>
                                Trò chuyện trực tiếp
                            </h3>
                            <span className="bg-emerald-950/50 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                142 người xem
                            </span>
                        </div>

                        {/* Danh sách tin nhắn chat */}
                        <div className="flex-1 overflow-y-auto pr-1 mb-3 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent flex flex-col-reverse">
                            {chatMessages.map((msg) => {
                                const isMe = msg.name === "Bạn (Tôi)";
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col max-w-[85%] rounded-2xl p-2.5 text-sm transition-all duration-300 ${
                                            isMe
                                                ? "bg-amber-500/10 border border-amber-500/20 self-end text-right"
                                                : "bg-slate-900/60 border border-slate-800/50 self-start"
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 mb-0.5 justify-start">
                                            <span className={`font-bold text-xs ${isMe ? "text-amber-400 ml-auto" : "text-slate-300"}`}>
                                                {msg.name}
                                            </span>
                                            <span className="text-[9px] text-slate-500 font-semibold font-mono">
                                                {msg.time}
                                            </span>
                                        </div>
                                        <p className={`text-slate-200 break-words leading-relaxed ${isMe ? "text-right" : "text-left"}`}>
                                            {msg.text}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input chat */}
                        <form onSubmit={handleSendChat} className="flex gap-2">
                            <input
                                type="text"
                                value={newMsg}
                                onChange={(e) => setNewMsg(e.target.value)}
                                placeholder="Nhập bình luận của bạn..."
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-550 focus:outline-none focus:border-amber-500/50 transition-all duration-350"
                            />
                            <button
                                type="submit"
                                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center border border-slate-800 active:scale-95"
                            >
                                <i className="fa-solid fa-paper-plane"></i>
                            </button>
                        </form>
                    </div>
                </div>

                {/* CỘT PHẢI (Đặt Giá & Lịch sử Đặt Giá) */}
                <div className="flex flex-col gap-8">
                    
                    {/* BẢNG ĐIỀU KHIỂN ĐẶT GIÁ (Interactive Bid Console) */}
                    <div className={`bg-[#0f172a]/40 border rounded-3xl p-6 shadow-2xl backdrop-blur-md transition-all duration-500 ${
                        bidSuccessGlow 
                            ? "border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-emerald-950/5" 
                            : "border-slate-800/80"
                    }`}>
                        {/* Banner Người Chiến Thắng khi đấu giá kết thúc */}
                        {auction.status === "ENDED" && (
                            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col gap-1.5 animate-fade-in shadow-lg">
                                <h4 className="text-emerald-400 font-extrabold text-sm flex items-center gap-1.5">
                                    <i className="fa-solid fa-trophy text-amber-400 animate-bounce"></i>
                                    PHIÊN ĐẤU GIÁ ĐÃ KẾT THÚC
                                </h4>
                                {auction.winner_id && highestBid ? (
                                    <p className="text-slate-300 text-xs leading-relaxed">
                                        Chúc mừng người chiến thắng: <strong className="text-emerald-400 font-bold">{highestBid.bidder_name}</strong> với mức giá cuối cùng là <strong className="text-amber-400 font-bold font-mono text-sm">{highestBid.bid_price.toLocaleString("vi-VN")} đ</strong>!
                                    </p>
                                ) : (
                                    <p className="text-slate-500 text-xs leading-relaxed">
                                        Không có lượt đặt thầu hợp lệ nào được ghi nhận cho phiên đấu giá này.
                                    </p>
                                )}
                            </div>
                        )}
                        
                        {/* Section Giá hiện tại */}
                        <div className="mb-5">
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                <i className="fa-solid fa-tag text-amber-500"></i>
                                Giá hiện tại
                            </span>
                            
                            <div className="flex items-baseline gap-1.5">
                                <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight font-mono transition-all duration-350 ${
                                    priceAnimate 
                                        ? "scale-102 text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse" 
                                        : "text-amber-400"
                                }`}>
                                    {auction.current_price.toLocaleString("vi-VN")}
                                </h2>
                                <span className="text-amber-500 font-bold text-base">đ</span>
                            </div>

                            {/* Show Người dẫn đầu nếu có */}
                            {highestBid && (
                                <div className="mt-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs animate-fade-in">
                                    <span className="text-slate-400 flex items-center gap-1.5">
                                        <i className="fa-solid fa-crown text-amber-500"></i>
                                        Người dẫn đầu:
                                    </span>
                                    <span className="font-bold text-amber-400">
                                        {highestBid.bidder_name}
                                    </span>
                                </div>
                            )}
                        </div>

                        <hr className="border-slate-800/60 mb-5" />

                        {/* Bước nhảy tối thiểu */}
                        <div className="mb-5 flex justify-between items-center bg-slate-950/60 rounded-2xl p-3 border border-slate-900">
                            <div>
                                <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider block">
                                    Mức tăng tối thiểu
                                </span>
                                <span className="text-sm font-bold text-slate-300 font-mono">
                                    + {auction.min_bid_increment.toLocaleString("vi-VN")} đ
                                </span>
                            </div>
                            <div className="bg-slate-800 px-2.5 py-1 rounded-lg text-slate-400 text-xs font-bold font-mono border border-slate-700/30">
                                Thầu tiếp
                            </div>
                        </div>

                        {/* Chọn nhanh mức tăng */}
                        <div className="mb-5">
                            <span className="text-slate-400 text-xs font-semibold mb-2.5 block">
                                Chọn nhanh lượng tăng thêm
                            </span>
                            <div className="grid grid-cols-2 gap-2.5">
                                {quickIncrements.map((item, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={auction.status !== "ACTIVE"}
                                        onClick={() => handleQuickSelect(item.value)}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-300 border font-mono ${
                                            auction.status !== "ACTIVE"
                                                ? "bg-slate-950/20 text-slate-600 border-slate-900/50 cursor-not-allowed opacity-40"
                                                : amount === item.value
                                                ? "bg-amber-500 text-black border-amber-500 shadow-md font-extrabold"
                                                : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700"
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Nhập giá tùy chỉnh */}
                        <div className="mb-5">
                            <label className="text-slate-400 text-xs font-semibold mb-2 block">
                                Hoặc nhập giá muốn tăng thêm
                            </label>
                            <div className="relative rounded-xl overflow-hidden shadow-inner">
                                <input
                                    type="number"
                                    disabled={auction.status !== "ACTIVE"}
                                    min={auction.min_bid_increment}
                                    step={auction.min_bid_increment}
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className={`w-full bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-amber-500/50 text-right pr-12 pl-4 py-2.5 rounded-xl font-bold font-mono text-white text-base focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all duration-300 ${
                                        auction.status !== "ACTIVE" ? "cursor-not-allowed opacity-40" : ""
                                    }`}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm pointer-events-none">
                                    đ
                                </div>
                            </div>
                        </div>

                        {/* Giá sau khi đấu */}
                        <div className="mb-5 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-2xl p-4 shadow-md">
                            <span className="text-slate-400 text-xs font-semibold block mb-1">
                                Giá đấu thầu tiếp theo của bạn
                            </span>
                            <div className="flex items-baseline gap-1">
                                <h3 className="text-2xl font-bold font-mono text-white">
                                    {finalPrice.toLocaleString("vi-VN")}
                                </h3>
                                <span className="text-slate-400 font-bold text-sm">đ</span>
                            </div>
                        </div>

                        {/* NÚT ĐẶT GIÁ CHÍNH */}
                        <button
                            type="button"
                            disabled={loading || auction.status !== "ACTIVE" || amount < auction.min_bid_increment}
                            onClick={handleSubmit}
                            className={`w-full py-3.5 rounded-2xl text-sm font-extrabold uppercase tracking-wider text-black shadow-md transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] ${
                                loading || auction.status !== "ACTIVE" || amount < auction.min_bid_increment
                                    ? "bg-slate-800 text-slate-500 border border-slate-750 cursor-not-allowed shadow-none"
                                    : "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 hover:shadow-lg cursor-pointer"
                            }`}
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                                    Đang truyền thầu...
                                </>
                            ) : auction.status === "PENDING" ? (
                                <>
                                    <i className="fa-solid fa-hourglass-start"></i>
                                    Chờ phiên bắt đầu
                                </>
                            ) : auction.status !== "ACTIVE" ? (
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
                    <div className="bg-[#0f172a]/40 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex-1 flex flex-col min-h-[350px] backdrop-blur-md">
                        <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2 border-b border-slate-800/80 pb-3">
                            <i className="fa-solid fa-clock-rotate-left text-amber-500"></i>
                            Lịch sử đấu giá
                            <span className="bg-slate-900 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto font-mono">
                                {bids.length} lượt thầu
                            </span>
                        </h3>

                        {!Array.isArray(bids) || bids.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
                                <i className="fa-solid fa-inbox text-2xl"></i>
                                <span className="text-sm font-semibold">Chưa có lượt đặt giá nào</span>
                                <span className="text-[10px] text-slate-500 text-center">Hãy là người đặt giá đầu tiên cho tài sản này!</span>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[280px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                                {bids.map((bid, index) => {
                                    const isFirst = index === 0;
                                    return (
                                        <div
                                            key={bid.id}
                                            className={`p-3 rounded-2xl flex items-center justify-between gap-3 border transition-all duration-300 ${
                                                isFirst
                                                    ? "bg-amber-500/10 border-amber-500/30 shadow-md animate-pulse"
                                                    : "bg-slate-950/40 border-slate-900/60 hover:border-slate-800"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Icon Avatar */}
                                                <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center text-xs font-bold border transition-colors ${
                                                    isFirst
                                                        ? "bg-amber-500 border-amber-400 text-black shadow-inner"
                                                        : "bg-slate-900 border-slate-800 text-slate-350"
                                                }`}>
                                                    {isFirst ? (
                                                        <i className="fa-solid fa-crown"></i>
                                                    ) : (
                                                        bid.bidder_name.slice(0, 1).toUpperCase()
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`text-xs font-bold ${isFirst ? "text-amber-400 font-extrabold" : "text-slate-200"}`}>
                                                            {bid.bidder_name}
                                                        </span>
                                                        {isFirst && (
                                                            <span className="bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase leading-none shadow-sm flex items-center gap-0.5">
                                                                Dẫn đầu
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 font-semibold block mt-0.5 font-mono">
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

                                            <div className="text-right">
                                                <span className={`text-sm font-extrabold font-mono block ${isFirst ? "text-amber-400" : "text-slate-105"}`}>
                                                    {bid.bid_price.toLocaleString("vi-VN")}
                                                </span>
                                                <span className={`text-[9px] font-bold ${isFirst ? "text-amber-500" : "text-slate-500"}`}>
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
        </div>
    );
}
