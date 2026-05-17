"use client";

import { Flex } from "antd";
import {
    useEffect,
    useState,
} from "react";

interface Props {
    images: string[];
}

export default function AuctionGallery({
    images,
}: Props) {

    const [selected, setSelected] =
        useState<string | null>(
            images[0] ?? null
        );

    const [zoomOpen, setZoomOpen] = useState(false);

    useEffect(() => {
        if (images.length === 0) {
            setSelected(null);
            setZoomOpen(false);
            return;
        }

        setSelected((current) => {
            if (
                current &&
                images.includes(current)
            ) {
                return current;
            }

            return images[0];
        });
    }, [images]);

    return (

        <>
            <div
                style={{
                    width: "100%",
                    height: 400,
                    borderRadius: 12,
                    overflow: "hidden",
                    cursor: selected
                        ? "zoom-in"
                        : "default",
                    background: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                onClick={() => {
                    if (selected) {
                        setZoomOpen(true);
                    }
                }}
            >

                {
                    selected ? (
                        <img
                            src={selected}
                            alt="Auction image"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    ) : (
                        <span
                            style={{
                                color: "#8c8c8c",
                            }}
                        >
                            No image available
                        </span>
                    )
                }

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
                                alt="Auction thumbnail"
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
                zoomOpen && selected && (

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
                            alt="Auction image zoom"
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
