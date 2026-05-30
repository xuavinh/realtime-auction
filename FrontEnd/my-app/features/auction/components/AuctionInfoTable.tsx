"use client";

import { Table } from "antd";

import type { ColumnsType } from "antd/es/table";

interface DataType {
    key: string;
    field: string;
    value: string;
}

interface Props {
    data: DataType[];
}

const columns: ColumnsType<DataType> = [
    {
        title: "Field",
        dataIndex: "field",
        key: "field",
        width: 250,
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
        render: (text, record) => {
            if (record.field === "Trạng thái") {
                const status = String(text).toUpperCase();
                let bg = "#f5f5f5";
                let textCol = "#666666";
                let border = "1px solid #d9d9d9";
                let label = status;

                if (status === "ACTIVE") {
                    bg = "#f6ffed";
                    textCol = "#389e0d";
                    border = "1px solid #b7eb8f";
                    label = "ĐANG DIỄN RA";
                } else if (status === "PENDING") {
                    bg = "#fffbe6";
                    textCol = "#d46b08";
                    border = "1px solid #ffe58f";
                    label = "SẮP DIỄN RA";
                } else if (status === "ENDED") {
                    bg = "#fff2f0";
                    textCol = "#cf1322";
                    border = "1px solid #ffccc7";
                    label = "ĐÃ KẾT THÚC";
                }

                return (
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 12px",
                            borderRadius: "16px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            background: bg,
                            color: textCol,
                            border: border,
                            letterSpacing: "0.5px"
                        }}
                    >
                        {status === "ACTIVE" && (
                            <span
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: "#52c41a",
                                    marginRight: 6,
                                    display: "inline-block",
                                    animation: "pulse-status 1.5s infinite"
                                }}
                            />
                        )}
                        {label}
                        <style>{`
                            @keyframes pulse-status {
                                0% { transform: scale(0.9); opacity: 1; }
                                50% { transform: scale(1.3); opacity: 0.4; }
                                100% { transform: scale(0.9); opacity: 1; }
                            }
                        `}</style>
                    </span>
                );
            }
            if (record.field === "Người chiến thắng" && text !== "Không có người đặt thầu hợp lệ") {
                return (
                    <span style={{ fontWeight: "bold", color: "#16a34a", fontSize: "14px" }}>
                        🏆 {text}
                    </span>
                );
            }
            return text;
        }
    },
];

export default function AuctionInfoTable({
    data,
}: Props) {

    return (

        <Table
            showHeader={false}
            columns={columns}
            dataSource={data}
            pagination={false}
            bordered={false}
            style={{
                padding: "20px 0px",
                marginTop: 20,
            }}
        />

    );
}