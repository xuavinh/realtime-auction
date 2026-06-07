"use client";

import { useState, useEffect } from "react";
import { Pagination, Row, Col, Spin, message, Button, Space, Input } from "antd";
import { useSearchParams, useRouter } from "next/navigation";

import AuctionCard from "./AuctionCard";
import {
    listAuctions,
    resolveAuctionImageUrl,
    type Auction,
} from "../services/auction.service";

const { Search } = Input;

const PAGE_SIZE = 16;

type SortType = "newest" | "price_asc" | "price_desc" | "ending_soon" | "relevance";

export default function AuctionList() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const querySearch = searchParams ? searchParams.get("search") || "" : "";

    const [page, setPage] = useState(1);
    const [items, setItems] = useState<Auction[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [sort, setSort] = useState<SortType>("newest");
    const [searchValue, setSearchValue] = useState(querySearch);

    // Đồng bộ searchValue khi URL search query thay đổi
    useEffect(() => {
        setSearchValue(querySearch);
        
        if (querySearch) {
            setSort("relevance");
        } else {
            setSort("newest");
        }
        setPage(1);
    }, [querySearch]);

    useEffect(() => {
        let cancelled = false;

        const loadAuctions = async () => {
            try {
                setLoading(true);

                const res = await listAuctions({
                    page,
                    limit: PAGE_SIZE,
                    sort,
                    search: querySearch || undefined,
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
    }, [page, sort, querySearch]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            {/* SEARCH BAR */}
            <div className="mb-6 max-w-md">
                <Search
                    placeholder="Tìm kiếm phiên đấu giá..."
                    allowClear
                    enterButton="Tìm kiếm"
                    size="large"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onSearch={(value) => {
                        const params = new URLSearchParams(window.location.search);
                        if (value.trim()) {
                            params.set("search", value.trim());
                        } else {
                            params.delete("search");
                        }
                        router.push(`${window.location.pathname}?${params.toString()}`);
                    }}
                />
            </div>

            {/* SORT BUTTONS */}
            <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-3 mb-6">
                {querySearch && (
                    <Button
                        type={sort === "relevance" ? "primary" : "default"}
                        onClick={() => {
                            setPage(1);
                            setSort("relevance");
                        }}
                        className="w-full lg:w-auto rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200"
                    >
                        Độ liên quan
                    </Button>
                )}

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
                                startTime={auction.start_time}
                                endTime={auction.end_time}
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