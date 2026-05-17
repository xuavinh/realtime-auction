"use client";

import { useState, useEffect } from "react";
import { Pagination, Row, Col, Spin, message } from "antd";

import AuctionCard from "./AuctionCard";
import {
    listAuctions,
    resolveAuctionImageUrl,
    type Auction,
} from "../services/auction.service"

const PAGE_SIZE = 16;

export default function AuctionList() {
    const [page, setPage] = useState(1);
    const [items, setItems] = useState<Auction[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const loadAuctions = async () => {
            try {
                setLoading(true);

                const res = await listAuctions({
                    page,
                    limit: PAGE_SIZE,
                    sort: "newest",
                });

                if (!cancelled) {
                    setItems(res.data);
                    setTotal(res.pagination.total);
                }
            }
            catch {
                if (!cancelled) {
                    message.error("Khong tai duoc danh sach dau gia")
                }
            }
            finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };
        void loadAuctions();

        return () => {
            cancelled = true;
        };
    }, [page]);

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <>
            <Row gutter={[16, 16]}>
                {items.map((auction) => {
                    const imageUrl =
                        auction.primary_image_url ||
                        auction.images?.[0]?.url ||
                        "";
                    return (
                        <Col
                            key={auction.id}
                            xs={24}
                            sm={12}
                            md={6}
                            lg={6}
                        >
                            <AuctionCard
                                id={String(auction.id)}
                                title={auction.title}
                                image={
                                    resolveAuctionImageUrl(imageUrl)
                                }
                                currentPrice={auction.current_price}
                                endTime={new Date(
                                    auction.end_time
                                ).toLocaleString("vi-VN")}
                                bidCount={0}
                                isLive={auction.status === "ACTIVE"}
                            />
                        </Col>
                    )
                })}
            </Row>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
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