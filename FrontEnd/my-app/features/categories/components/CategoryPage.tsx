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
        <div className="max-w-[1320px] mx-auto my-8 px-3 md:px-12 xl:px-0">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">{categoryName}</h1>

            <Row gutter={[24, 24]}>
                {currentAuctions.map((auction) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={auction.id}>
                        <AuctionCard
                            id={String(auction.id)}
                            title={auction.title}
                            image={resolveAuctionImageUrl(auction.primary_image_url || "")}
                            currentPrice={auction.current_price}
                            startTime={auction.start_time}
                            endTime={auction.end_time}
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