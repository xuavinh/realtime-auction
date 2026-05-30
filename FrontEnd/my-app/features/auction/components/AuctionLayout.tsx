"use client";

import { useEffect, useState } from "react";
import { Layout, Spin, message } from "antd";

import AuctionGallery from "./AuctionGallery";
import AuctionInfoTable from "./AuctionInfoTable";
import AuctionSidebar from "./AuctionSidebar";

import {
    getAuctionById,
    resolveAuctionImageUrl,
    listAuctionBids,
    type Auction,
} from "../services/auction.service";

const { Sider, Content } = Layout;

type Props = {
    auctionId: number;
}

export default function AuctionLayout({
    auctionId,
}: Props) {
    const [auction, setAuction] =
        useState<Auction | null>(null);
    const [loading, setLoading] =
        useState(true);
    const [bidCount, setBidCount] =
        useState<number>(0);
    const [winner, setWinner] =
        useState<{ name: string; price: number } | null>(null);

    // State kiểm tra màn hình mobile để render layout dọc
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        if (typeof window !== "undefined") {
            window.addEventListener("resize", handleResize);
            handleResize();
        }
        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("resize", handleResize);
            }
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);

        if (!Number.isFinite(auctionId) || auctionId <= 0) {
            setAuction(null);
            setLoading(false);
            return;
        }

        const loadAuction = async () => {
            try {
                const data =
                    await getAuctionById(
                        auctionId
                    );
                if (!cancelled) {
                    setAuction(data);
                }

                // Gọi thêm API lấy lịch sử thầu để lấy tổng số lượt đấu giá thực tế
                try {
                    const bidsRes = await listAuctionBids(auctionId, 1, 1);
                    if (bidsRes && bidsRes.pagination && !cancelled) {
                        setBidCount(bidsRes.pagination.total);
                        if (bidsRes.data && bidsRes.data.length > 0) {
                            setWinner({
                                name: bidsRes.data[0].bidder_name,
                                price: bidsRes.data[0].bid_price
                            });
                        }
                    }
                } catch (bidErr) {
                    console.error("Failed to load bid count:", bidErr);
                }
            }
            catch {
                if (!cancelled) {
                    message.error(
                        "Khong tai duoc chi tiet dau gia"
                    );
                }
            }
            finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadAuction();

        return () => {
            cancelled = true;
        };
    }, [auctionId]);

    if (loading) {
        return <Spin size="large" />;
    }

    if (!auction) {
        return <div>Không tìm thấy auction.</div>;
    }

    const images =
        auction.images?.length
            ? auction.images.map((image) =>
                resolveAuctionImageUrl(image.url)
            )
            : auction.primary_image_url
                ? [resolveAuctionImageUrl(auction.primary_image_url)]
                : [];

    const data = [
        {
            key: "1",
            field: "Mô tả",
            value: auction.description || "Chưa có mô tả",
        },
        {
            key: "2",
            field: "Danh mục",
            value: auction.category?.name || "Chưa có danh mục",
        },
        {
            key: "3",
            field: "Trạng thái",
            value: auction.status,
        },
        {
            key: "4",
            field: "Bắt đầu",
            value: new Date(
                auction.start_time
            ).toLocaleString("vi-VN"),
        },
        {
            key: "5",
            field: "Kết thúc",
            value: new Date(
                auction.end_time
            ).toLocaleString("vi-VN"),
        },
    ];

    if (auction.status === "ENDED") {
        data.push({
            key: "6",
            field: "Người chiến thắng",
            value: auction.winner_id && winner ? `${winner.name} (với mức giá ${winner.price.toLocaleString("vi-VN")} đ)` : "Không có người đặt thầu hợp lệ",
        });
    }

    if (isMobile) {
        // Render dạng cột dọc đơn giản trên di động để tránh lỗi Antd Sider
        return (
            <div className="my-8 mx-3 flex flex-col gap-6 bg-white">
                <div className="bg-white">
                    <AuctionGallery images={images} />
                    <AuctionInfoTable data={data} />
                </div>
                <div className="bg-white p-5 border border-slate-100 rounded-3xl shadow-sm">
                    <AuctionSidebar auction={auction} bidCount={bidCount} winner={winner} />
                </div>
            </div>
        );
    }

    // Giữ nguyên 100% giao diện nguyên bản ban đầu của trang chi tiết đấu giá trên màn hình PC lớn
    return (
        <Layout
            style={{
                margin: "30px 108.4px",
                padding: 0,
                background: "#ffffff",
            }}
        >
            <Content style={{ background: "#ffffff", paddingRight: 40 }}>
                <AuctionGallery
                    images={images}
                />
                <AuctionInfoTable
                    data={data}
                />
            </Content>

            <Sider
                width={400}
                style={{
                    background: "#fff",
                    padding: 20,
                }}
            >
                <AuctionSidebar auction={auction} bidCount={bidCount} winner={winner} />
            </Sider>
        </Layout>
    );
}
