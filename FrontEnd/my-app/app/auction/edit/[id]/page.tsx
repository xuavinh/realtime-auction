"use client";

import React, {
    useEffect,
    useRef,
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
    Modal,
    Select,
    Spin,
    Typography,
    Upload,
    message,
} from "antd";

import type {
    UploadFile,
    UploadProps,
} from "antd";

import {
    CloseOutlined,
    InboxOutlined,
} from "@ant-design/icons";

import {
    getAuctionById,
    updateAuction,
    uploadAuctionImage,
    deleteAuctionImage,
    resolveAuctionImageUrl,
    listAuctionCategories,
    type AuctionCategory,
    type AuctionImage,
} from "@/features/auction/services/auction.service";

import {
    useParams,
    useRouter,
} from "next/navigation";

import styles from "./page.module.css";

const { Dragger } = Upload;
const { TextArea } = Input;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_IMAGES = 10;

type EditAuctionFormValues = {
    productName: string;
    description?: string;
    categoryId?: number;
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

type SelectedUploadFile = NonNullable<UploadFile["originFileObj"]>;

function flattenCategories(
    categories: AuctionCategory[]
): AuctionCategory[] {
    return categories.flatMap((category) => [
        category,
        ...flattenCategories(category.children || []),
    ]);
}

function getErrorMessage(error: unknown, fallback: string) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    return (
        axiosError.response?.data?.details?.[0]?.message ||
        axiosError.response?.data?.message ||
        fallback
    );
}

function formatNumberInput(value?: number | string | null) {
    return `${value ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseNumberInput(value?: string) {
    const parsed = Number((value ?? "").replace(/,/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
}

export default function EditAuctionPage() {
    const router = useRouter();
    const params = useParams();
    const auctionId = Number(params.id);

    const [form] = Form.useForm<EditAuctionFormValues>();

    const [messageApi, contextHolder] = message.useMessage();

    // Giữ ref để tránh messageApi thay đổi reference gây re-fetch
    const messageApiRef = useRef(messageApi);
    messageApiRef.current = messageApi;

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [existingImages, setExistingImages] = useState<AuctionImage[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<
        Array<{ value: number; label: string }>
    >([]);
    const [loadingAuction, setLoadingAuction] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notAllowed, setNotAllowed] = useState(false);
    const [initialValues, setInitialValues] = useState<EditAuctionFormValues | null>(null);

    // Load danh mục — dùng messageApiRef để tránh re-fetch do reference thay đổi
    useEffect(() => {
        let cancelled = false;

        const loadCategories = async () => {
            try {
                const categories = await listAuctionCategories();

                if (cancelled) return;

                setCategoryOptions(
                    flattenCategories(categories).map((category) => ({
                        value: category.id,
                        label: category.name,
                    }))
                );
            } catch {
                messageApiRef.current.error("Không tải được danh mục");
            } finally {
                if (!cancelled) setLoadingCategories(false);
            }
        };

        void loadCategories();

        return () => {
            cancelled = true;
        };
    }, []); // deps rỗng vì dùng ref

    // Load thông tin đấu giá
    useEffect(() => {
        let cancelled = false;

        const loadAuction = async () => {
            try {
                const auction = await getAuctionById(auctionId);

                if (cancelled) return;

                // Chặn nếu không phải PENDING
                if (auction.status !== "PENDING") {
                    setNotAllowed(true);
                    return;
                }

                setExistingImages(auction.images ?? []);

                setInitialValues({
                    productName: auction.title,
                    description: auction.description,
                    categoryId: auction.category_id ?? undefined,
                    startTime: dayjs(auction.start_time),
                    endTime: dayjs(auction.end_time),
                    startingPrice: auction.start_price,
                    minBidIncrement: auction.min_bid_increment,
                });
            } catch {
                messageApiRef.current.error("Không tải được dữ liệu đấu giá");
            } finally {
                if (!cancelled) setLoadingAuction(false);
            }
        };

        void loadAuction();

        return () => {
            cancelled = true;
        };
    }, [auctionId]); // bỏ form khỏi deps vì không dùng form.setFieldsValue nữa

    // Xác nhận trước khi xóa ảnh hiện có
    const handleRemoveExistingImage = (imageId: number) => {
        Modal.confirm({
            title: "Xóa ảnh",
            content: "Bạn có chắc muốn xóa ảnh này không?",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk() {
                setExistingImages((prev) =>
                    prev.filter((image) => image.id !== imageId)
                );
                setDeletedImageIds((prev) =>
                    prev.includes(imageId) ? prev : [...prev, imageId]
                );
            },
        });
    };

    // maxCount tính theo số ảnh hiện có để không vượt quá giới hạn tổng
    const remainingSlots = Math.max(
        0,
        MAX_TOTAL_IMAGES - existingImages.length
    );

    const uploadProps: UploadProps = {
        name: "file",
        multiple: true,
        maxCount: remainingSlots,
        accept: ".jpg,.jpeg,.png",
        fileList,

        beforeUpload(file) {
            const isAllowedType =
                file.type === "image/jpeg" || file.type === "image/png";

            if (!isAllowedType) {
                messageApiRef.current.error("Chỉ nhận ảnh JPG hoặc PNG.");
                return Upload.LIST_IGNORE;
            }

            if (file.size > MAX_IMAGE_BYTES) {
                messageApiRef.current.error("Mỗi ảnh tối đa 5MB.");
                return Upload.LIST_IGNORE;
            }

            return false;
        },

        onChange(info) {
            setFileList(info.fileList);
        },
    };

    const onFinish = async (values: EditAuctionFormValues) => {
        if (existingImages.length === 0 && fileList.length === 0) {
            messageApiRef.current.error(
                "Vui lòng tải lên hoặc giữ lại ít nhất 1 hình ảnh."
            );
            return;
        }

        const files = fileList
            .map((file) => file.originFileObj)
            .filter((file): file is SelectedUploadFile => Boolean(file));

        if (files.length !== fileList.length) {
            messageApiRef.current.error(
                "Có tệp ảnh không hợp lệ, vui lòng chọn lại."
            );
            return;
        }

        let infoUpdated = false;
        try {
            setSubmitting(true);

            await updateAuction(auctionId, {
                title: values.productName,
                description: values.description?.trim() || undefined,
                category_id: values.categoryId,
                start_price: values.startingPrice,
                min_bid_increment: values.minBidIncrement,
                start_time: values.startTime.toISOString(),
                end_time: values.endTime.toISOString(),
            });

            infoUpdated = true;

            // Xóa và upload ảnh song song thay vì tuần tự
            await Promise.all(
                deletedImageIds.map((id) => deleteAuctionImage(auctionId, id))
            );

            await Promise.all(
                files.map((file) => uploadAuctionImage(auctionId, file))
            );

            router.push(
                "/users/myauction?updated=1"
            );
        } catch (error) {
            if (infoUpdated) {
                messageApiRef.current.warning(
                    `Đã cập nhật thông tin phiên đấu giá nhưng xử lý hình ảnh gặp lỗi. ${getErrorMessage(
                        error,
                        "Bạn có thể tải lại ảnh sau."
                    )}`
                );
                router.push("/auction/my-auction");
                return;
            }

            messageApiRef.current.error(
                getErrorMessage(error, "Cập nhật đấu giá thất bại")
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingAuction || loadingCategories) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: 40,
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {contextHolder}

            {notAllowed ? (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 60,
                        gap: 16,
                    }}
                >
                    <Typography.Title level={4} style={{ color: "#ff4d4f" }}>
                        Không thể chỉnh sửa
                    </Typography.Title>
                    <Typography.Text type="secondary">
                        Chỉ có thể chỉnh sửa đấu giá đang ở trạng thái{" "}
                        <strong>PENDING</strong>.
                    </Typography.Text>
                    <Button onClick={() => router.push("/auction/my-auction")}>
                        Quay lại danh sách
                    </Button>
                    {/* Form ẩn để giữ form instance luôn kết nối, tránh warning */}
                    <div style={{ display: "none" }}>
                        <Form form={form} />
                    </div>
                </div>
            ) : (
                <Card className={styles.card} title="Chỉnh sửa phiên đấu giá">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={initialValues || undefined}
                    >
                        {/* Hình ảnh sản phẩm */}
                        <Form.Item label="Hình ảnh sản phẩm">
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 12,
                                    marginBottom: 16,
                                }}
                            >
                                {existingImages.map((image) => (
                                    <div
                                        key={image.id}
                                        style={{ position: "relative" }}
                                    >
                                        <img
                                            src={resolveAuctionImageUrl(image.url)}
                                            alt=""
                                            style={{
                                                width: 120,
                                                height: 120,
                                                objectFit: "cover",
                                                borderRadius: 8,
                                                border: "1px solid #ddd",
                                            }}
                                        />

                                        {/* Dùng CloseOutlined thay vì text "X" */}
                                        <Button
                                            danger
                                            size="small"
                                            icon={<CloseOutlined />}
                                            style={{
                                                position: "absolute",
                                                top: 4,
                                                right: 4,
                                            }}
                                            onClick={() =>
                                                handleRemoveExistingImage(image.id)
                                            }
                                        />
                                    </div>
                                ))}
                            </div>

                            <Dragger {...uploadProps}>
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>

                                <p className="ant-upload-text">
                                    Click hoặc kéo ảnh vào đây
                                </p>

                                <p className="ant-upload-hint">
                                    Tối đa {MAX_TOTAL_IMAGES} ảnh, JPG/PNG, mỗi ảnh
                                    tối đa 5MB
                                    {remainingSlots < MAX_TOTAL_IMAGES &&
                                        ` (còn có thể thêm ${remainingSlots} ảnh)`}
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
                                    message: "Vui lòng nhập tên sản phẩm",
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
                            <Input />
                        </Form.Item>

                        {/* Mô tả */}
                        <Form.Item
                            label="Mô tả"
                            name="description"
                            rules={[
                                {
                                    max: 2000,
                                    message: "Mô tả tối đa 2000 ký tự",
                                },
                            ]}
                        >
                            <TextArea rows={4} />
                        </Form.Item>

                        {/* Danh mục */}
                        <Form.Item
                            label="Danh mục"
                            name="categoryId"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn danh mục",
                                },
                            ]}
                        >
                            <Select options={categoryOptions} />
                        </Form.Item>

                        {/* Thời gian bắt đầu */}
                        <Form.Item
                            label="Thời gian bắt đầu"
                            name="startTime"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn thời gian bắt đầu",
                                },
                                {
                                    validator(_, value) {
                                        if (!value) {
                                            return Promise.resolve();
                                        }

                                        if (
                                            value.isBefore(
                                                dayjs().add(5, "minute")
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
                                style={{ width: "100%" }}
                                disabledDate={(current) =>
                                    !!current &&
                                    current < dayjs().startOf("day")
                                }
                            />
                        </Form.Item>

                        {/* Thời gian kết thúc — validate phải sau startTime */}
                        <Form.Item
                            label="Thời gian kết thúc"
                            name="endTime"
                            dependencies={["startTime"]}
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn thời gian kết thúc",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const start =
                                            getFieldValue("startTime");

                                        if (!start || !value) {
                                            return Promise.resolve();
                                        }

                                        if (!value.isAfter(start)) {
                                            return Promise.reject(
                                                new Error(
                                                    "Thời gian kết thúc phải sau thời gian bắt đầu"
                                                )
                                            );
                                        }

                                        if (
                                            value.diff(start, "minute") < 5
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
                                style={{ width: "100%" }}
                                disabledDate={(current) =>
                                    !!current &&
                                    current < dayjs().startOf("day")
                                }
                            />
                        </Form.Item>

                        {/* Giá khởi điểm */}
                        <Form.Item
                            label="Giá khởi điểm"
                            name="startingPrice"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập giá khởi điểm",
                                },
                                {
                                    type: "number",
                                    min: 10000,
                                    message: "Giá khởi điểm tối thiểu là 10,000đ",
                                },
                            ]}
                        >
                            <InputNumber<number>
                                style={{ width: "100%" }}
                                formatter={formatNumberInput}
                                parser={parseNumberInput}
                            />
                        </Form.Item>

                        {/* Bước giá tối thiểu */}
                        <Form.Item
                            label="Bước giá tối thiểu"
                            name="minBidIncrement"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập bước giá tối thiểu",
                                },
                                {
                                    type: "number",
                                    min: 10000,
                                    message: "Bước giá tối thiểu là 10,000đ",
                                },
                            ]}
                        >
                            <InputNumber<number>
                                style={{ width: "100%" }}
                                formatter={formatNumberInput}
                                parser={parseNumberInput}
                            />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={submitting}
                        >
                            Cập nhật đấu giá
                        </Button>
                    </Form>
                </Card>
            )}
        </div>
    );
}
