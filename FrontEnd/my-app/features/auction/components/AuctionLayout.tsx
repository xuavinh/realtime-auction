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

                <AuctionSidebar auction={auction} bidCount={bidCount} />

            </Sider>

        </Layout>
    );
}
