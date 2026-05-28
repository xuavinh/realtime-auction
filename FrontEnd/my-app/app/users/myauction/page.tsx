'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { useEffect, useRef, useState, Suspense } from 'react';

import {
    Button,
    Card,
    Col,
    Empty,
    Image,
    message,
    Modal,
    Pagination,
    Row,
    Skeleton,
    Space,
    Tag,
    Tooltip,
    Typography,
} from 'antd';

import {
    ClockCircleOutlined,
    DeleteOutlined,
    EditOutlined,
} from '@ant-design/icons';

import dayjs from 'dayjs';

import styles from './myauction.module.css';

import {
    deleteAuction,
    listMyAuctions,
    resolveAuctionImageUrl,
    type AuctionListItem,
} from '@/features/auction/services/auction.service';

const { Title, Text } = Typography;

const PAGE_SIZE = 10;

type SortType =
    | 'newest'
    | 'price_asc'
    | 'price_desc'
    | 'ending_soon';

const canEdit = (auction: AuctionListItem) =>
    auction.status === 'PENDING';

const statusMap: Record<
    string,
    {
        color: string;
        label: string;
    }
> = {
    ACTIVE: {
        color: 'green',
        label: 'ACTIVE',
    },

    PENDING: {
        color: 'gold',
        label: 'PENDING',
    },

    ENDED: {
        color: 'red',
        label: 'ENDED',
    },

    CANCELLED: {
        color: 'default',
        label: 'CANCELLED',
    },
};

function MyAuctionPageContent() {
    const router = useRouter();

    const searchParams =
        useSearchParams();

    const hasShownMessage = useRef(false);

    const [messageApi, contextHolder] =
        message.useMessage();

    const messageApiRef = useRef(messageApi);
    messageApiRef.current = messageApi;

    const [page, setPage] = useState(1);

    const [items, setItems] = useState<AuctionListItem[]>([]);

    const [total, setTotal] = useState(0);

    const [loading, setLoading] =
        useState(true);

    const [sort, setSort] =
        useState<SortType>('newest');

    // Kiểm tra token chủ động ngay khi truy cập trang
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token');
            if (!token) {
                messageApi.error('Bạn cần đăng nhập để truy cập trang này!');
                router.push('/auth/login');
            }
        }
    }, [router, messageApi]);

    useEffect(() => {
        let cancelled = false;

        const loadAuctions = async () => {
            try {
                // Nếu không có token thì không tải để tránh lỗi 401 console
                const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
                if (!token) return;

                setLoading(true);

                const res =
                    await listMyAuctions({
                        page,
                        limit: PAGE_SIZE,
                        sort,
                    });

                if (cancelled) {
                    return;
                }

                setItems(res.data);

                setTotal(
                    res.pagination.total
                );
            }
            catch (error: any) {
                console.error("Error loading my auctions:", error);

                if (!cancelled) {
                    if (error?.response?.status === 401) {
                        messageApiRef.current.error(
                            'Phiên đăng nhập đã hết hạn. Đang chuyển hướng đăng nhập...'
                        );
                        setTimeout(() => {
                            router.push('/auth/login');
                        }, 1200);
                        return;
                    }
                    
                    messageApiRef.current.error(
                        'Không tải được danh sách đấu giá'
                    );
                }
            }
            finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadAuctions();


        return () => {
            cancelled = true;
        };
    }, [page, sort, router]);

    useEffect(() => {
        const updated =
            searchParams.get("updated");

        if (updated === "1" && !hasShownMessage.current) {
            hasShownMessage.current = true;
            messageApi.success(
                "Cập nhật đấu giá thành công"
            );


            router.replace(
                "/users/myauction"
            );
        }
    }, [
        searchParams,
        messageApi,
        router,
    ]);

    const handleDelete = (
        auction: AuctionListItem
    ) => {
        if (!canEdit(auction)) {
            messageApiRef.current.warning(
                'Chỉ có thể xóa đấu giá đang ở trạng thái PENDING'
            );

            return;
        }

        Modal.confirm({
            title: 'Xóa đấu giá?',
            content:
                'Bạn có chắc muốn xóa đấu giá này?',
            centered: true,
            okText: 'Xóa',
            cancelText: 'Hủy',

            okButtonProps: {
                danger: true,
            },

            onOk: async () => {
                try {
                    await deleteAuction(
                        auction.id
                    );

                    setItems((prev) =>
                        prev.filter(
                            (item) =>
                                item.id !==
                                auction.id
                        )
                    );

                    setTotal((prev) =>
                        Math.max(prev - 1, 0)
                    );

                    messageApiRef.current.success(
                        'Đã xóa đấu giá'
                    );
                }
                catch (error) {
                    console.error(error);

                    messageApiRef.current.error(
                        'Xóa đấu giá thất bại'
                    );
                }
            },
        });
    };

    const handleEdit = (
        auction: AuctionListItem
    ) => {
        if (!canEdit(auction)) {
            messageApiRef.current.warning(
                'Chỉ có thể chỉnh sửa đấu giá đang ở trạng thái PENDING'
            );

            return;
        }

        router.push(
            `/auction/edit/${auction.id}`
        );
    };

    return (
        <>
            {contextHolder}

            <div className={styles.container}>
                <div className={styles.header}>
                    <Title
                        level={2}
                        className={styles.title}
                    >
                        Đấu giá của tôi
                    </Title>
                </div>

                {/* SORT */}
                <Space
                    style={{
                        marginBottom: 24,
                    }}
                    wrap
                >
                    {(
                        [
                            {
                                key: 'newest',
                                label: 'Mới nhất',
                            },

                            {
                                key: 'ending_soon',
                                label: 'Sắp kết thúc',
                            },

                            {
                                key: 'price_asc',
                                label: 'Giá thấp → cao',
                            },

                            {
                                key: 'price_desc',
                                label: 'Giá cao → thấp',
                            },
                        ] as const
                    ).map(
                        ({
                            key,
                            label,
                        }) => (
                            <Button
                                key={key}
                                type={
                                    sort === key
                                        ? 'primary'
                                        : 'default'
                                }
                                onClick={() => {
                                    setPage(1);

                                    setSort(key);
                                }}
                            >
                                {label}
                            </Button>
                        )
                    )}
                </Space>

                {/* LOADING */}
                {loading ? (
                    <Row gutter={[24, 24]}>
                        {Array.from({
                            length: 4,
                        }).map((_, i) => (
                            <Col
                                xs={24}
                                key={i}
                            >
                                <Card>
                                    <Skeleton
                                        active
                                        avatar
                                        paragraph={{
                                            rows: 3,
                                        }}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : items.length === 0 ? (
                    <div
                        className={
                            styles.emptyWrapper
                        }
                    >
                        <Empty description="Bạn chưa có đấu giá nào" />
                    </div>
                ) : (
                    <>
                        <Row gutter={[24, 24]}>
                            {items.map((item) => {
                                const imageUrl =
                                    resolveAuctionImageUrl(
                                        item.primary_image_url || undefined
                                    );

                                const editable =
                                    canEdit(
                                        item
                                    );

                                const status =
                                    statusMap[
                                    item
                                        .status
                                    ] || {
                                        color: 'default',
                                        label: item.status,
                                    };

                                return (
                                    <Col
                                        xs={24}
                                        key={
                                            item.id
                                        }
                                    >
                                        <Card
                                            className={
                                                styles.card
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.cardContent
                                                }
                                            >
                                                {/* IMAGE */}
                                                <div
                                                    className={
                                                        styles.imageWrapper
                                                    }
                                                >
                                                    <Image
                                                        src={
                                                            imageUrl ||
                                                            '/images/no-image.png'
                                                        }
                                                        alt={
                                                            item.title
                                                        }
                                                        preview={
                                                            false
                                                        }
                                                        className={
                                                            styles.image
                                                        }
                                                    />
                                                </div>

                                                {/* INFO */}
                                                <div
                                                    className={
                                                        styles.info
                                                    }
                                                >
                                                    <div>
                                                        <Title
                                                            level={
                                                                4
                                                            }
                                                            className={
                                                                styles.itemTitle
                                                            }
                                                        >
                                                            {
                                                                item.title
                                                            }
                                                        </Title>

                                                        <Space
                                                            wrap
                                                            size={
                                                                10
                                                            }
                                                            style={{
                                                                marginBottom:
                                                                    12,
                                                            }}
                                                        >
                                                            <Tag color="blue">
                                                                {new Intl.NumberFormat(
                                                                    'en-US',
                                                                    {
                                                                        style:
                                                                            'currency',
                                                                        currency:
                                                                            'USD',
                                                                    }
                                                                ).format(
                                                                    item.current_price
                                                                )}
                                                            </Tag>

                                                            <Tag
                                                                color={
                                                                    status.color
                                                                }
                                                            >
                                                                {
                                                                    status.label
                                                                }
                                                            </Tag>
                                                        </Space>

                                                        <Space
                                                            orientation="vertical"
                                                            size={
                                                                4
                                                            }
                                                        >
                                                            <Text style={{ color: 'red' }}>
                                                                <ClockCircleOutlined />{' '}
                                                                Kết thúc:{' '}
                                                                {dayjs(item.end_time).format('DD/MM/YYYY HH:mm')}
                                                            </Text>
                                                        </Space>
                                                    </div>

                                                    {/* ACTIONS */}
                                                    <Space
                                                        wrap
                                                        size={
                                                            12
                                                        }
                                                    >
                                                        <Tooltip
                                                            title={
                                                                editable
                                                                    ? undefined
                                                                    : 'Chỉ có thể chỉnh sửa khi đấu giá ở trạng thái PENDING'
                                                            }
                                                        >
                                                            <Button
                                                                type="primary"
                                                                icon={
                                                                    <EditOutlined />
                                                                }
                                                                disabled={
                                                                    !editable
                                                                }
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        item
                                                                    )
                                                                }
                                                            >
                                                                Sửa
                                                            </Button>
                                                        </Tooltip>

                                                        <Tooltip
                                                            title={
                                                                editable
                                                                    ? undefined
                                                                    : 'Chỉ có thể xóa khi đấu giá ở trạng thái PENDING'
                                                            }
                                                        >
                                                            <Button
                                                                danger
                                                                icon={
                                                                    <DeleteOutlined />
                                                                }
                                                                disabled={
                                                                    !editable
                                                                }
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        item
                                                                    )
                                                                }
                                                            >
                                                                Xóa
                                                            </Button>
                                                        </Tooltip>
                                                    </Space>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>

                        {/* PAGINATION */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent:
                                    'center',

                                marginTop: 32,
                            }}
                        >
                            <Pagination
                                current={page}
                                pageSize={
                                    PAGE_SIZE
                                }
                                total={total}
                                onChange={(p) =>
                                    setPage(p)
                                }
                                showSizeChanger={
                                    false
                                }
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default function MyAuctionPage() {
    return (
        <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Đang tải danh sách đấu giá...</div>}>
            <MyAuctionPageContent />
        </Suspense>
    );
}