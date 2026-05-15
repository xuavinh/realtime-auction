"use client";

import React from "react";

import {
    Button,
    Card,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Upload,
    message,
} from "antd";

import type { UploadProps } from "antd";

import { InboxOutlined } from "@ant-design/icons";

import styles from "./page.module.css";

const { Dragger } = Upload;

const { TextArea } = Input;

export default function NewAuctionPage() {

    const [messageApi, contextHolder] = message.useMessage();

    const uploadProps: UploadProps = {

        name: "file",

        multiple: true,

        action:
            "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",

        onChange(info) {

            const { status } = info.file;

            if (status === "done") {

                messageApi.success(
                    `${info.file.name} upload thành công`
                );

            } else if (status === "error") {

                messageApi.error(
                    `${info.file.name} upload thất bại`
                );
            }
        },

    };

    const onFinish = (values: any) => {

        console.log(values);

        messageApi.success("Đăng tải đấu giá thành công!");
    };

    return (

        <div className={styles.container}>

            {contextHolder}

            <Card
                className={styles.card}
                title="Tạo Phiên Đấu Giá"
            >

                <Form
                    layout="vertical"
                    onFinish={onFinish}
                >

                    {/* Upload */}

                    <Form.Item
                        label="Hình ảnh sản phẩm"
                        required
                    >

                        <Dragger {...uploadProps}>

                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>

                            <p className="ant-upload-text">
                                Click hoặc kéo ảnh vào đây
                            </p>

                            <p className="ant-upload-hint">
                                Hỗ trợ upload nhiều ảnh <span style={{ fontStyle: "italic" }}>(Tối đa 10 hình ảnh)</span>
                            </p>

                        </Dragger>

                    </Form.Item>

                    {/* Tên sản phẩm */}

                    <Form.Item
                        label="Tên sản phẩm"
                        name="productName"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Vui lòng nhập tên sản phẩm",
                            },
                        ]}
                    >

                        <Input
                            placeholder="Nhập tên sản phẩm"
                            size="large"
                        />

                    </Form.Item>

                    {/* Mô tả */}

                    <Form.Item
                        label="Mô tả"
                        name="description"
                    >

                        <TextArea
                            rows={4}
                            placeholder="Nhập mô tả sản phẩm"
                        />

                    </Form.Item>

                    {/* Thời gian bắt đầu */}

                    <Form.Item
                        label="Thời gian bắt đầu"
                        name="startTime"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Vui lòng chọn thời gian bắt đầu",
                            },
                        ]}
                    >

                        <DatePicker
                            showTime
                            size="large"
                            style={{ width: "100%" }}
                            format="DD/MM/YYYY HH:mm"
                        />

                    </Form.Item>

                    {/* Thời gian kết thúc */}

                    <Form.Item
                        label="Thời gian kết thúc"
                        name="endTime"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Vui lòng chọn thời gian kết thúc",
                            },
                        ]}
                    >

                        <DatePicker
                            showTime
                            size="large"
                            style={{ width: "100%" }}
                            format="DD/MM/YYYY HH:mm"
                        />

                    </Form.Item>
                    {/* Giá khởi điểm */}

                    <Form.Item
                        label="Giá khởi điểm"
                        name="startingPrice"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Vui lòng nhập giá khởi điểm",
                            },
                        ]}
                    >

                        <InputNumber
                            style={{ width: "100%" }}
                            size="large"
                            min={0}
                            placeholder="Nhập giá khởi điểm"
                            formatter={(value) =>
                                `${value}`.replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ","
                                )
                            }
                        />

                    </Form.Item>

                    {/* Button */}

                    <Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                        >
                            Đăng tải đấu giá
                        </Button>

                    </Form.Item>

                </Form>

            </Card>

        </div>
    );
}
