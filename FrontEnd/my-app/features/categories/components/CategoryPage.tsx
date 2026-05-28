"use client";

import { useState } from "react";
import { Pagination, Row, Col } from "antd";
import { AuctionListItem, resolveAuctionImageUrl } from "@/features/auction/services/auction.service";
import AuctionCard from "@/features/auction/components/AuctionCard";

interface Props {
    categoryName: string;
    auctions: AuctionListItem[];
}

export default function CategoryPage({
    categoryName,
    auctions,
}: Props) {
    const [currentPage, setCurrentPage] = useState(1);

    const pageSize = 16;

    const startIndex = (currentPage - 1) * pageSize;

    const currentAuctions = auctions.slice(
        startIndex,
        startIndex + pageSize
    );

    return (
        <div style={{ margin: "30px 108.4px" }}>
            <h1 style={{ marginBottom: 25, fontSize: "28px", fontWeight: 800, color: "#111827" }}>{categoryName}</h1>

            <Row gutter={[24, 24]}>
                {currentAuctions.map((auction) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={auction.id}>
                        <AuctionCard
                            id={String(auction.id)}
                            title={auction.title}
                            image={resolveAuctionImageUrl(auction.primary_image_url || "")}
                            currentPrice={auction.current_price}
                            endTime={new Date(auction.end_time).toLocaleString("vi-VN")}
                            status={auction.status}
                        />
                    </Col>
                ))}
            </Row>

            <div
                style={{
                    marginTop: 40,
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={auctions.length}
                    onChange={(page) => setCurrentPage(page)}
                />
            </div>
        </div>
    );
}