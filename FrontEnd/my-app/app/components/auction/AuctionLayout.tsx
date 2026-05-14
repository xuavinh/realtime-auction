"use client";

import { Layout } from "antd";

import AuctionGallery from "./AuctionGallery";

import AuctionInfoTable from "./AuctionInfoTable";

import AuctionSidebar from "./AuctionSidebar";

const { Sider, Content } = Layout;

const images = [
    "https://picsum.photos/id/1011/800/500",
    "https://picsum.photos/id/1015/800/500",
    "https://picsum.photos/id/1016/800/500",
    "https://picsum.photos/id/1025/800/500",
];

const data = [
    {
        key: "1",
        field: "Thông tin chi tiết",
        value: "Đã qua sử dụng",
    },
    {
        key: "2",
        field: "Mô tả",
        value: "Sản phẩm còn mới 90%",
    },
    {
        key: "3",
        field: "Vận chuyển từ",
        value: "Hà Nội",
    },
    {
        key: "4",
        field: "Email",
        value: "hieu@example.com",
    },
    {
        key: "5",
        field: "Điện thoại",
        value: "0123456789",
    },
    {
        key: "6",
        field: "Phương thức thanh toán",
        value: "Chuyển khoản ngân hàng",
    }
];

export default function AuctionLayout() {

    return (

        <Layout
            style={{
                margin: "30px 108.4px",
                minHeight: "100vh",
                padding: 0,
            }}
        >

            <Content>

                <AuctionGallery
                    images={images}
                />

                <AuctionInfoTable
                    data={data}
                />

            </Content>

            <Sider
                width={400}
                style={{
                    background: "#fff",
                    padding: 20,
                }}
            >

                <AuctionSidebar />

            </Sider>

        </Layout>
    );
}