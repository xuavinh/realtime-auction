"use client";

import { useState } from "react";
import { message } from "antd";
import { placeBid } from "@/features/auction/services/auction.service";
import { useBidStore } from "../store/bid.store";

export function usePlaceBid(
    auctionId: number
) {
    const [loading, setLoading] =
        useState(false);
    const setCurrentPrice =
        useBidStore(
            (s) => s.setCurrentPrice
        );

    const handlePlaceBid = async (
        bidAmount: number
    ): Promise<void> => {
        if (!auctionId) {
            message.error(
                "Auction ID không hợp lệ"
            );
            return;
        }

        if (bidAmount <= 0) {
            message.error(
                "Số tiền đấu giá phải lớn hơn 0"
            );
            return;
        }

        try {
            setLoading(true);

            const response =
                await placeBid(auctionId, {
                    bid_price: bidAmount,
                });

            if (response) {
                message.success(
                    "Đặt giá thầu thành công!"
                );
                setCurrentPrice(
                    response.current_price
                );

                // Phát sự kiện thầu thành công để cập nhật giao diện ngay lập tức mà không cần reload/WebSocket
                if (typeof window !== "undefined") {
                    const savedFullName = localStorage.getItem("user_full_name");
                    const email = localStorage.getItem("user_email");
                    const bidderName = savedFullName || (email ? email.split("@")[0] : "Bạn");
                    window.dispatchEvent(new CustomEvent("auction-bid-success", {
                        detail: {
                            bid_id: response.bid_id,
                            bid_price: response.current_price || bidAmount,
                            end_time: response.end_time,
                            bidder_name: bidderName
                        }
                    }));
                }
            }
        } catch (error: any) {
            const errorData = error?.response?.data;

            // Xử lý thông minh khi gặp lỗi đặt thầu chậm do có người khác thầu nhanh hơn (Outbid Fallback)
            if (errorData && (errorData.error === "bid_too_low" || errorData.error === "conflict")) {
                const latestPrice = errorData.fallback_data?.latest_price;
                if (latestPrice > 0) {
                    setCurrentPrice(latestPrice);
                    
                    // Phát sự kiện để cập nhật giá trị thầu mới nhất lên giao diện page.tsx
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("auction-price-update", {
                            detail: { price: latestPrice }
                        }));
                    }
                    
                    message.warning("Giá đấu thầu đã thay đổi! Đã có người khác vừa trả giá cao hơn. Hệ thống đã tự động cập nhật giá mới nhất, vui lòng bấm đặt thầu lại!");
                    return;
                }
            }

            const rawErrorMsg =
                errorData?.message ||
                errorData?.error ||
                error?.message ||
                "Lỗi khi đặt giá thầu";

            console.warn(
                "[Bid] Đặt thầu bị từ chối bởi quy tắc đấu giá:",
                rawErrorMsg
            );

            // Dịch lỗi thầu sang Tiếng Việt thân thiện
            const translateBidError = (msg: string): string => {
                const lower = msg.toLowerCase();
                if (lower.includes("own auction")) {
                    return "Bạn không thể tự đặt giá thầu trên sản phẩm do chính mình tạo ra!";
                }
                if (lower.includes("not active")) {
                    return "Phiên đấu giá hiện chưa bắt đầu hoặc đang được kích hoạt. Vui lòng tải lại trang (F5) hoặc đợi vài giây để hệ thống đồng bộ trạng thái!";
                }
                if (lower.includes("already ended") || lower.includes("has ended")) {
                    return "Phiên đấu giá này đã kết thúc!";
                }
                if (lower.includes("below minimum") || lower.includes("too low")) {
                    return "Giá đặt thầu của bạn thấp hơn mức tăng tối thiểu yêu cầu!";
                }
                if (lower.includes("outbid")) {
                    return "Đã có người khác vừa đặt giá cao hơn, vui lòng đặt giá cao hơn!";
                }
                return msg;
            };

            message.error(translateBidError(rawErrorMsg));
        } finally {
            setLoading(false);
        }
    };

    return {
        handlePlaceBid,
        loading,
    };
}
