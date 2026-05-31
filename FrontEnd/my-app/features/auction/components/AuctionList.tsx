"use client";

import { useState, useEffect } from "react";
import { Pagination, Row, Col, Spin, message, Button, Space } from "antd";

import AuctionCard from "./AuctionCard";
import {
    listAuctions,
    resolveAuctionImageUrl,
    type Auction,
} from "../services/auction.service";

const PAGE_SIZE = 16;

type SortType = "newest" | "price_asc" | "price_desc" | "ending_soon";

export default function AuctionList() {
    const [page, setPage] = useState(1);
    const [items, setItems] = useState<Auction[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [sort, setSort] = useState<SortType>("newest");

    useEffect(() => {
        let cancelled = false;

        const loadAuctions = async () => {
            try {
                setLoading(true);

                const res = await listAuctions({
                    page,
                    limit: PAGE_SIZE,
                    sort,
                });

                if (!cancelled) {
                    setItems(res.data);
                    setTotal(res.pagination.total);
                }
            } catch {
                if (!cancelled) {
                    message.error("Không tải được danh sách đấu giá");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadAuctions();

        return () => {
            cancelled = true;
        };
    }, [page, sort]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            {/* SORT BUTTONS */}
            <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-3 mb-6">
                <Button
                    type={sort === "newest" ? "primary" : "default"}
                    onClick={() => {
                        setPage(1);
                        setSort("newest");
                    }}
                    className="w-full lg:w-auto rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200"
                >
                    Mới nhất
                </Button>

                <Button
                    type={sort === "ending_soon" ? "primary" : "default"}
                    onClick={() => {
                        setPage(1);
                        setSort("ending_soon");
                    }}
                    className="w-full lg:w-auto rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200"
                >
                    Sắp kết thúc
                </Button>

                <Button
                    type={sort === "price_asc" ? "primary" : "default"}
                    onClick={() => {
                        setPage(1);
                        setSort("price_asc");
                    }}
                    className="w-full lg:w-auto rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200"
                >
                    Giá thấp → cao
                </Button>

                <Button
                    type={sort === "price_desc" ? "primary" : "default"}
                    onClick={() => {
                        setPage(1);
                        setSort("price_desc");
                    }}
                    className="w-full lg:w-auto rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200"
                >
                    Giá cao → thấp
                </Button>
            </div>

            {/* GRID */}
            <Row gutter={[16, 16]}>
                {items.map((auction) => {
                    const imageUrl =
                        auction.primary_image_url ||
                        auction.images?.[0]?.url ||
                        "";

                    return (
                        <Col key={auction.id} xs={24} sm={12} md={6} lg={6}>
                            <AuctionCard
                                id={String(auction.id)}
                                title={auction.title}
                                image={resolveAuctionImageUrl(imageUrl)}
                                currentPrice={auction.current_price}
                                startTime={auction.start_time ? new Date(auction.start_time).toLocaleString("vi-VN") : undefined}
                                endTime={new Date(
                                    auction.end_time
                                ).toLocaleString("vi-VN")}
                                status={auction.status}
                            />
                        </Col>
                    );
                })}
            </Row>

            {/* PAGINATION */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 24,
                }}
            >
                <Pagination
                    current={page}
                    pageSize={PAGE_SIZE}
                    total={total}
                    onChange={(p) => setPage(p)}
                    showSizeChanger={false}
                />
            </div>
        </>
    );
}