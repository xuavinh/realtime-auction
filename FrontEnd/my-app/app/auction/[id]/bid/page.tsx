"use client";

import { useState, useCallback, useEffect } from "react";
import AuctionBidLayout, { BidHistoryItem, AuctionData } from "./components/BidForm";
import { useAuctionSocket } from "./hooks/useAuctionSocket";
import { usePlaceBid } from "./hooks/usePlaceBid";
import { useParams } from "next/navigation";
import { getAuctionById, listAuctionBids, resolveAuctionImageUrl } from "@/features/auction/services/auction.service";
import { message } from "antd";

export default function BidPage() {
    const params = useParams();
    const auctionId = Number(params.id);
    const [isMounted, setIsMounted] = useState(false);

    // Đảm bảo component đã mount trên client trước khi render dữ liệu động
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [pageLoading, setPageLoading] = useState(true);
    const [auction, setAuction] = useState<AuctionData>({
        id: auctionId,
        title: "Đang tải...",
        image: "",
        current_price: 0,
        min_bid_increment: 10000,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        status: "ACTIVE"
    });

    const [bids, setBids] = useState<BidHistoryItem[]>([]);
    const [fullName, setFullName] = useState<string>("");

    // Giải mã JWT offline để lấy Họ tên đầy đủ (full_name) từ token đăng nhập
    useEffect(() => {
        const parseUserProfileFromToken = () => {
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
                if (!token) return;

                // Hàm decode JWT Payload offline
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    window
                        .atob(base64)
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                const payload = JSON.parse(jsonPayload);
                
                const name = payload?.full_name;
                if (name) {
                    setFullName(name);
                    localStorage.setItem("user_full_name", name);
                }
            } catch (error) {
                console.error("Error parsing user profile from token:", error);
                const savedName = localStorage.getItem("user_full_name");
                if (savedName) setFullName(savedName);
            }
        };

        if (isMounted) {
            parseUserProfileFromToken();
        }
    }, [isMounted]);

    // Fetch dữ liệu ban đầu
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!auctionId) return;

            try {
                setPageLoading(true);
                
                // Fetch thông tin chi tiết đấu giá độc lập
                try {
                    const auctionRes = await getAuctionById(auctionId);
                    if (auctionRes) {
                        const imageUrl = auctionRes.images?.length 
                            ? auctionRes.images[0].url 
                            : (auctionRes.primary_image_url || "");

                        setAuction({
                            id: auctionRes.id,
                            title: auctionRes.title,
                            image: resolveAuctionImageUrl(imageUrl),
                            current_price: auctionRes.current_price,
                            min_bid_increment: auctionRes.min_bid_increment,
                            start_time: auctionRes.start_time,
                            end_time: auctionRes.end_time,
                            status: auctionRes.status
                        });
                    }
                } catch (error) {
                    console.error("Error fetching auction detail:", error);
                    message.error("Không thể tải thông tin chi tiết sản phẩm");
                }

                // Fetch lịch sử đấu giá độc lập
                try {
                    const bidsRes = await listAuctionBids(auctionId);
                    if (bidsRes && bidsRes.data) {
                        setBids(bidsRes.data);
                    }
                } catch (error) {
                    console.error("Error fetching bid history:", error);
                    // Lỗi lịch sử thầu không nên làm sập cả trang sản phẩm
                }

            } catch (error) {
                console.error("Error in fetchInitialData:", error);
            } finally {
                setPageLoading(false);
            }
        };

        if (isMounted) {
            fetchInitialData();
        }
    }, [auctionId, isMounted]);

    const { handlePlaceBid, loading } = usePlaceBid(auctionId);

    // Xử lý khi có bid mới từ Socket
    const handleNewBid = useCallback((newBid: any) => {
        // Cập nhật giá hiện tại trong UI
        setAuction(prev => ({
            ...prev,
            current_price: newBid.bid_price
        }));

        // Thêm vào lịch sử (đưa lên đầu) - Kiểm tra trùng lặp để tránh hiển thị lặp lại lượt thầu của chính mình
        setBids(prev => {
            const exists = prev.some(b => b.id === newBid.id);
            if (exists) return prev;

            return [
                {
                    id: newBid.id,
                    bidder_name: newBid.bidder_name,
                    bid_price: newBid.bid_price,
                    created_at: newBid.created_at
                },
                ...prev
            ];
        });
    }, []);

    useAuctionSocket(auctionId, handleNewBid);

    // Lắng nghe các sự kiện cập nhật giá thầu và thầu thành công để cập nhật giao diện ngay lập tức
    useEffect(() => {
        // Sự kiện 1: Khi đặt thầu bị vượt mặt (lỗi outbid fallback)
        const handlePriceUpdate = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail && detail.price > 0) {
                setAuction(prev => ({
                    ...prev,
                    current_price: detail.price
                }));
            }
        };

        // Sự kiện 2: Khi chính người dùng đặt thầu thành công (200 OK)
        const handleBidSuccess = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail && detail.bid_price > 0) {
                // Cập nhật giá hiện tại và thời gian kết thúc mới (nếu có gia hạn thầu từ backend)
                setAuction(prev => ({
                    ...prev,
                    current_price: detail.bid_price,
                    end_time: detail.end_time || prev.end_time
                }));

                // Thêm lượt thầu mới này vào danh sách lịch sử đấu giá hiển thị (nếu chưa có trong list)
                setBids(prev => {
                    const exists = prev.some(b => b.id === detail.bid_id);
                    if (exists) return prev; // Tránh trùng lặp với WebSocket nếu nhận đồng thời

                    return [
                        {
                            id: detail.bid_id,
                            bidder_name: detail.bidder_name || "Bạn",
                            bid_price: detail.bid_price,
                            created_at: new Date().toISOString()
                        },
                        ...prev
                    ];
                });
            }
        };

        if (typeof window !== "undefined") {
            window.addEventListener("auction-price-update", handlePriceUpdate);
            window.addEventListener("auction-bid-success", handleBidSuccess);
        }
        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("auction-price-update", handlePriceUpdate);
                window.removeEventListener("auction-bid-success", handleBidSuccess);
            }
        };
    }, []);

    // Hiển thị trạng thái loading khi chưa mounted hoặc đang fetch data
    if (!isMounted || pageLoading) {
        return null; // Hoặc một Loading Skeleton đơn giản
    }

    return (
        <div className="bg-[#090d16] min-h-screen w-full p-4 md:p-6">
            <AuctionBidLayout
                auction={auction}
                bids={bids}
                onPlaceBid={handlePlaceBid}
            />
        </div>
    );
}