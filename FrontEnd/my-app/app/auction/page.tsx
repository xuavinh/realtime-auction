"use client";

import React, { useState } from "react";
import { Layout, Flex, Button } from "antd";

import { Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { title } from "process";
import { ColumnsType } from "antd/es/table/interface";

import styles from "../styles/auction.module.css";

const { Sider, Content } = Layout;

const images = [
    "https://picsum.photos/id/1011/800/500",
    "https://picsum.photos/id/1015/800/500",
    "https://picsum.photos/id/1016/800/500",
    "https://picsum.photos/id/1025/800/500",
];

interface DataType {
    key: string;
    field: string;
    value: string;
}

const columns: ColumnsType<DataType> = [
    {
        title: "Field",
        dataIndex: "field",
        key: "field",
        width: 250, // tăng độ rộng cột trái
        render: (text) => (
            <span style={{ fontWeight: "bold" }}>
                {text}
            </span>
        ),
    },
    {
        title: "Value",
        dataIndex: "value",
        key: "value",
    },
];

const data: DataType[] = [
    {
        key: "1",
        field: "Thông tin chi tiết",
        value: "Đã qua sử dụng",
    },
    {
        key: "2",
        field: "Mô tả",
        value: "Sản phẩm đã qua sử dụng, còn mới 90%. Có một vài vết xước nhỏ nhưng không ảnh hưởng đến chức năng. Đóng gói cẩn thận, giao hàng nhanh chóng.",
    },
    {
        key: "3",
        field: "Vận chuyển từ",
        value: "Hà Nội",
    },
    {
        key: "4",
        field: "Email",
        value: "vana@gmail.com",
    },
    {
        key: "5",
        field: "Thanh toán",
        value: "Chuyển khoản ngân hàng",
    },
];

export default function Auction() {
    const [selected, setSelected] = useState(images[0]);
    const [zoomOpen, setZoomOpen] = useState(false);

    return (
        <Layout style={{ margin: "0px 108.4px", minHeight: "100vh", padding: 0 }}>
            <Content>
                {/* ẢNH LỚN */}
                <div
                    style={{
                        width: "100%",
                        height: 400,
                        borderRadius: 12,
                        overflow: "hidden",
                        cursor: "zoom-in",
                    }}
                    onClick={() => setZoomOpen(true)}
                >
                    <img
                        src={selected}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                </div>

                {/* THUMBNAIL */}
                <Flex gap={10} style={{ marginTop: 15 }}>
                    {images.map((img) => (
                        <div
                            key={img}
                            onClick={() => setSelected(img)}
                            style={{
                                width: 90,
                                height: 60,
                                border:
                                    selected === img
                                        ? "3px solid #1677ff"
                                        : "1px solid #ddd",
                                borderRadius: 8,
                                overflow: "hidden",
                                cursor: "pointer",
                            }}
                        >
                            <img
                                src={img}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </div>
                    ))}
                </Flex>
                <Table
                    showHeader={false}
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    bordered={false}
                    style={{ padding: "20px 0px", marginTop: 20 }}
                />
            </Content>

            <Sider width={400} style={{ background: "#ffffff", padding: 20 }}>
                <div className={styles.productBox}>
                    <div className={styles.productInfo}>
                        <h2>
                            1 $Reserve Greenstone chỉ / PATU 329mm
                        </h2>

                        <p>
                            Đóng cửa: Thứ Bảy ngày 16 tháng Năm, 5:00 chiều
                        </p>

                        <Button type="primary" block>
                            + Thêm vào danh sách theo dõi
                        </Button>
                    </div>

                    <div className={styles.bidSection}>
                        <h3>Giá thầu hiện tại</h3>

                        <p className={styles.currentPrice}>
                            $115.00
                        </p>

                        <Button type="primary" block>
                            Đặt giá thầu
                        </Button>

                        <div className={styles.bidHistory}>
                            <h4>Dự trữ đã đáp ứng</h4>

                            <p>20 giá thầu cho đến nay - xem lịch sử</p>
                        </div>

                        <div className={styles.shipping}>
                            🚚 Vận chuyển từ $20.00
                        </div>
                    </div>
                </div>
            </Sider>

            {/* ================= LIGHTBOX ZOOM ================= */}
            {zoomOpen && (
                <div
                    onClick={() => setZoomOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        cursor: "zoom-out",
                    }}
                >
                    <img
                        src={selected}
                        style={{
                            maxWidth: "90%",
                            maxHeight: "90%",
                            borderRadius: 10,
                            transform: "scale(1)",
                            transition: "0.3s",
                        }}
                    />
                </div>
            )}
        </Layout>
    );
}