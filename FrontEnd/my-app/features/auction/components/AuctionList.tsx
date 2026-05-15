"use client";

import { useState, useMemo } from "react";
import { Pagination, Row, Col } from "antd";
import AuctionCard from "./AuctionCard";

const PAGE_SIZE = 16;

// mock data (sau này thay bằng API)
const DATA = Array.from({ length: 20 }).map((_, i) => ({
    id: `${i + 1}`,
    title: `Nhẫn kim cương thiên nhiên 18K #${i + 1}`,
    image:
        "https://caohungdiamond.com/wp-content/uploads/2023/06/hai-vien-kim-cuong-do-tinh-khiet-cao.jpg",
    currentPrice: 200000000 + i * 5000000,
    endTime: "16/05/2026 - 17:00",
    bidCount: 100 + i * 3,
}));

export default function AuctionList() {
    const [page, setPage] = useState(1);

    const currentData = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return DATA.slice(start, start + PAGE_SIZE);
    }, [page]);

    return (
        <>
            <Row gutter={[16, 16]}>
                {currentData.map((item) => (
                    <Col key={item.id} xs={24} sm={12} md={6} lg={6}>
                        <AuctionCard {...item} />
                    </Col>
                ))}
            </Row>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                <Pagination
                    current={page}
                    pageSize={PAGE_SIZE}
                    total={DATA.length}
                    onChange={(p) => setPage(p)}
                    showSizeChanger={false}
                />
            </div>
        </>
    );
}