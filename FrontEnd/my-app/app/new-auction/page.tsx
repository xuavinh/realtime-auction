"use client";

import React, {
    useEffect,
    useState,
} from "react";

import dayjs, {
    type Dayjs,
} from "dayjs";

import type { AxiosError } from "axios";

import {
    Button,
    Card,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    message,
} from "antd";

import type {
    UploadFile,
    UploadProps,
} from "antd";

import { InboxOutlined } from "@ant-design/icons";

import {
    createAuction,
    listAuctionCategories,
    uploadAuctionImage,
    deleteAuction,
    type AuctionCategory,
} from "@/features/auction/services/auction.service";

import styles from "./page.module.css";

const { Dragger } = Upload;
const { TextArea } = Input;

const MAX_IMAGE_BYTES =
    5 * 1024 * 1024;

type NewAuctionFormValues = {
    productName: string;
    description?: string;
    categoryId: number;
    startTime: Dayjs;
    endTime: Dayjs;
    startingPrice: number;
    minBidIncrement: number;
};

type ApiErrorResponse = {
    details?: Array<{
        message: string;
    }>;
    message?: string;
};

type SelectedUploadFile =
    NonNullable<
        UploadFile["originFileObj"]
    >;

function flattenCategories(
    categories: AuctionCategory[]
): AuctionCategory[] {
    return categories.flatMap(
        (category) => [
            category,
            ...flattenCategories(
                category.children || []
            ),
        ]
    );
}

function getErrorMessage(
    error: unknown,
    fallback: string
) {
    const axiosError =
        error as AxiosError<ApiErrorResponse>;

    const firstDetail =
        axiosError.response?.data
            ?.details?.[0];

    return (
        firstDetail?.message ||
        axiosError.response?.data
            ?.message ||
        fallback
    );
}

function formatNumberInput(
    value?: number | string | null
) {
    return `${value ?? ""}`.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ","
    );
}

function parseNumberInput(
    value?: string
) {
    const parsed = Number(
        (value ?? "").replace(
            /,/g,
            ""
        )
    );

    return Number.isNaN(parsed)
        ? 0
        : parsed;
}

export default function NewAuctionPage() {
    const [form] =
        Form.useForm<NewAuctionFormValues>();

    const [
        messageApi,
        contextHolder,
    ] = message.useMessage();

    const [fileList, setFileList] =
        useState<UploadFile[]>([]);

    const [
        categoryOptions,
        setCategoryOptions,
    ] = useState<
        Array<{
            value: number;
            label: string;
        }>
    >([]);

    const [
        loadingCategories,
        setLoadingCategories,
    ] = useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const startTime =
        Form.useWatch(
            "startTime",
            form
        );

    useEffect(() => {
        let cancelled = false;

        const loadCategories =
            async () => {
                try {
                    const categories =
                        await listAuctionCategories();

                    if (cancelled) {
                        return;
                    }

                    setCategoryOptions(
                        flattenCategories(
                            categories
                        ).map(
                            (
                                category
                            ) => ({
                                value:
                                    category.id,
                                label:
                                    category.name,
                            })
                        )
                    );
                } catch (error) {
                    if (!cancelled) {
                        messageApi.error(
                            getErrorMessage(
                                error,
                                "Không tải được danh mục."
                            )
                        );
                    }
                } finally {
                    if (!cancelled) {
                        setLoadingCategories(
                            false
                        );
                    }
                }
            };

        void loadCategories();

        return () => {
            cancelled = true;
        };
    }, [messageApi]);

    const uploadProps: UploadProps =
    {
        name: "file",
        multiple: true,
        maxCount: 10,
        accept:
            ".jpg,.jpeg,.png",
        fileList,

        beforeUpload(file) {
            const isAllowedType =
                file.type ===
                "image/jpeg" ||
                file.type ===
                "image/png";

            if (
                !isAllowedType
            ) {
                messageApi.error(
                    "Chỉ nhận ảnh JPG hoặc PNG."
                );

                return Upload.LIST_IGNORE;
            }

            if (
                file.size >
                MAX_IMAGE_BYTES
            ) {
                messageApi.error(
                    "Mỗi ảnh tối đa 5MB."
                );

                return Upload.LIST_IGNORE;
            }

            return false;
        },

        onChange(info) {
            setFileList(
                info.fileList
            );
        },
    };

    const onFinish = async (
        values: NewAuctionFormValues
    ) => {
        if (
            fileList.length === 0
        ) {
            messageApi.error(
                "Vui lòng tải lên ít nhất 1 hình ảnh."
            );
            return;
        }

        const files = fileList
            .map(
                (file) =>
                    file.originFileObj
            )
            .filter(
                (
                    file
                ): file is SelectedUploadFile =>
                    Boolean(file)
            );

        if (
            files.length !==
            fileList.length
        ) {
            messageApi.error(
                "Có tệp ảnh không hợp lệ, vui lòng chọn lại."
            );
            return;
        }

        let createdAuctionId:
            | number
            | null = null;

        try {
            setSubmitting(
                true
            );

            const auction =
                await createAuction(
                    {
                        title:
                            values.productName.trim(),
                        description:
                            values.description?.trim() ||
                            undefined,
                        category_id:
                            values.categoryId,
                        start_price:
                            values.startingPrice,
                        min_bid_increment:
                            values.minBidIncrement,
                        start_time:
                            values.startTime.toISOString(),
                        end_time:
                            values.endTime.toISOString(),
                    }
                );

            createdAuctionId =
                auction.id;

            await Promise.all(
                files.map(
                    (
                        file
                    ) =>
                        uploadAuctionImage(
                            auction.id,
                            file
                        )
                )
            );

            form.resetFields();
            setFileList([]);

            messageApi.success(
                "Đăng tải đấu giá thành công!"
            );
        } catch (error) {
            // Rollback: Nếu đã tạo đấu giá thành công nhưng tải ảnh thất bại, ta chủ động xóa đấu giá đó để bảo toàn dữ liệu
            if (
                createdAuctionId
            ) {
                try {
                    await deleteAuction(createdAuctionId);
                } catch (delError) {
                    console.error("Failed to rollback created auction:", delError);
                }
            }
 
            messageApi.error(
                getErrorMessage(
                    error,
                    "Đăng tải đấu giá thất bại! Lỗi trong quá trình tải lên hình ảnh sản phẩm."
                )
            );
        } finally {
            setSubmitting(
                false
            );
        }
    };

    return (
        <div
            className={
                styles.container
            }
        >
            {contextHolder}

            <Card
                className={
                    styles.card
                }
                title="Tạo Phiên Đấu Giá"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={
                        onFinish
                    }
                >
                    <Form.Item
                        label="Hình ảnh sản phẩm"
                        required
                    >
                        <Dragger
                            {
                            ...uploadProps
                            }
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>

                            <p className="ant-upload-text">
                                Click hoặc kéo ảnh vào đây
                            </p>

                            <p className="ant-upload-hint">
                                JPG/PNG,
                                tối đa
                                10 ảnh,
                                mỗi ảnh
                                không quá
                                5MB.
                            </p>
                        </Dragger>
                    </Form.Item>

                    <Form.Item
                        label="Tên sản phẩm"
                        name="productName"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Vui lòng nhập tên sản phẩm",
                            },
                            {
                                min: 10,
                                message:
                                    "Tên sản phẩm phải có ít nhất 10 ký tự",
                            },
                            {
                                max: 255,
                                message:
                                    "Tên sản phẩm tối đa 255 ký tự",
                            },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="Nhập tên sản phẩm"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                        rules={[
                            {
                                max: 2000,
                                message:
                                    "Mô tả tối đa 2000 ký tự",
                            },
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Nhập mô tả sản phẩm"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Danh mục"
                        name="categoryId"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Vui lòng chọn danh mục",
                            },
                        ]}
                    >
                        <Select
                            size="large"
                            placeholder="Chọn danh mục"
                            options={
                                categoryOptions
                            }
                            loading={
                                loadingCategories
                            }
                            disabled={
                                loadingCategories
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        label="Thời gian bắt đầu"
                        name="startTime"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Vui lòng chọn thời gian bắt đầu",
                            },
                            {
                                validator(
                                    _,
                                    value
                                ) {
                                    if (
                                        !value
                                    ) {
                                        return Promise.resolve();
                                    }

                                    if (
                                        value.isBefore(
                                            dayjs().add(
                                                5,
                                                "minute"
                                            )
                                        )
                                    ) {
                                        return Promise.reject(
                                            new Error(
                                                "Thời gian bắt đầu phải sau hiện tại ít nhất 5 phút"
                                            )
                                        );
                                    }

                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <DatePicker
                            showTime
                            size="large"
                            style={{
                                width: "100%",
                            }}
                            format="DD/MM/YYYY HH:mm"
                            disabledDate={(
                                current
                            ) =>
                                !!current &&
                                current <
                                dayjs().startOf(
                                    "day"
                                )
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        label="Thời gian kết thúc"
                        name="endTime"
                        dependencies={[
                            "startTime",
                        ]}
                        rules={[
                            {
                                required: true,
                                message:
                                    "Vui lòng chọn thời gian kết thúc",
                            },
                            ({
                                getFieldValue,
                            }) => ({
                                validator(
                                    _
                                    ,
                                    value
                                ) {
                                    const start =
                                        getFieldValue(
                                            "startTime"
                                        );

                                    if (
                                        !start ||
                                        !value
                                    ) {
                                        return Promise.resolve();
                                    }

                                    if (
                                        !value.isAfter(
                                            start
                                        )
                                    ) {
                                        return Promise.reject(
                                            new Error(
                                                "Thời gian kết thúc phải sau thời gian bắt đầu"
                                            )
                                        );
                                    }

                                    if (
                                        value.diff(
                                            start,
                                            "minute"
                                        ) <
                                        5
                                    ) {
                                        return Promise.reject(
                                            new Error(
                                                "Phiên đấu giá phải kéo dài ít nhất 5 phút"
                                            )
                                        );
                                    }

                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <DatePicker
                            showTime
                            size="large"
                            style={{
                                width: "100%",
                            }}
                            format="DD/MM/YYYY HH:mm"
                            disabledDate={(
                                current
                            ) =>
                                !!current &&
                                current <
                                dayjs().startOf(
                                    "day"
                                )
                            }
                        />
                    </Form.Item>

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
                        <InputNumber<number>
                            size="large"
                            style={{
                                width: "100%",
                            }}
                            min={
                                10000
                            }
                            formatter={
                                formatNumberInput
                            }
                            parser={
                                parseNumberInput
                            }
                            placeholder="Nhập giá khởi điểm"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Bước giá tối thiểu"
                        name="minBidIncrement"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Vui lòng nhập bước giá tối thiểu",
                            },
                        ]}
                    >
                        <InputNumber<number>
                            size="large"
                            style={{
                                width: "100%",
                            }}
                            min={
                                10000
                            }
                            formatter={
                                formatNumberInput
                            }
                            parser={
                                parseNumberInput
                            }
                            placeholder="Nhập bước giá tối thiểu"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            loading={
                                submitting
                            }
                            disabled={
                                loadingCategories
                            }
                        >
                            Đăng tải đấu giá
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}