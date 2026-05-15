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