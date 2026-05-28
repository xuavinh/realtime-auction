"use client";

import { useState } from "react";
import { Card, Pagination, Row, Col } from "antd";
import { AuctionListItem, resolveAuctionImageUrl } from "@/features/auction/services/auction.service";

const { Meta } = Card;

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
            <h1 style={{ marginBottom: 20 }}>{categoryName}</h1>

            <Row gutter={[24, 24]}>
                {currentAuctions.map((auction) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={auction.id}>
                        <Card
                            hoverable
                            cover={
                                <img
                                    src={resolveAuctionImageUrl(
                                        auction.primary_image_url
                                    )}
                                    alt={auction.title}
                                    style={{
                                        height: 400,
                                        objectFit: "cover",
                                    }}
                                />
                            }
                        >
                            <Meta
                                title={auction.title}
                                description={`Giá hiện tại: ${auction.current_price.toLocaleString()} đ`}
                            />
                        </Card>
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