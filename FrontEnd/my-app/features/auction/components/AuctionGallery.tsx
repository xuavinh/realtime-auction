"use client";

import { Flex } from "antd";
import { useState } from "react";

interface Props {
    images: string[];
}

export default function AuctionGallery({
    images,
}: Props) {

    const [selected, setSelected] = useState(images[0]);

    const [zoomOpen, setZoomOpen] = useState(false);

    return (

        <>
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

            <Flex gap={10} style={{ marginTop: 15 }}>

                {
                    images.map((img) => (

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
                    ))
                }

            </Flex>

            {
                zoomOpen && (

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
                        }}
                    >

                        <img
                            src={selected}
                            style={{
                                maxWidth: "90%",
                                maxHeight: "90%",
                                borderRadius: 10,
                            }}
                        />

                    </div>
                )
            }
        </>
    );
}