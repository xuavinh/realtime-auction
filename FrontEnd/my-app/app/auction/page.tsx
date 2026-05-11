"use client";

import React, { useState } from "react";
import { Layout, Flex } from "antd";

const { Sider, Content } = Layout;

const images = [
    "https://picsum.photos/id/1011/800/500",
    "https://picsum.photos/id/1015/800/500",
    "https://picsum.photos/id/1016/800/500",
    "https://picsum.photos/id/1025/800/500",
];

export default function Auction() {
    const [selected, setSelected] = useState(images[0]);
    const [zoomOpen, setZoomOpen] = useState(false);

    return (
        <Layout style={{ minHeight: "100vh", padding: 20 }}>
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
            </Content>

            <Sider width={400} style={{ background: "#ffffff", padding: 20 }}>
                Sidebar đấu giá
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