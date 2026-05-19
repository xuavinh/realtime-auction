'use client';

import React, { useState } from 'react';
import {
    Badge,
    Button,
    Card,
    Col,
    Empty,
    Image,
    message,
    Row,
    Space,
    Tag,
    Typography,
    Modal,
} from 'antd';

import {
    ClockCircleOutlined,
    DeleteOutlined,
    EyeOutlined,
    HeartFilled,
} from '@ant-design/icons';

import styles from './watchlist.module.css';

const { Title, Text } = Typography;

const initialWatchlist = [
    {
        id: 1,
        title: 'Rolex Submariner Date 2024',
        image:
            'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1200&auto=format&fit=crop',
        currentBid: '$12,500',
        endTime: '20 May 2026 • 21:30',
        bids: 18,
    },
    {
        id: 2,
        title: 'MacBook Pro M4 Max 16 inch',
        image:
            'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=1200&auto=format&fit=crop',
        currentBid: '$3,200',
        endTime: '21 May 2026 • 18:00',
        bids: 27,
    },
    {
        id: 3,
        title: 'Nike Air Jordan Retro Chicago',
        image:
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
        currentBid: '$980',
        endTime: '22 May 2026 • 10:15',
        bids: 9,
    },
];

const WatchlistPage = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [watchlist, setWatchlist] = useState(initialWatchlist);

    const handleRemove = (id: number) => {
        Modal.confirm({
            title: 'Xóa khỏi watchlist?',
            content: 'Bạn có chắc muốn xóa đấu giá này?',
            centered: true,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: {
                danger: true,
            },
            onOk: () => {
                setWatchlist((prev) => prev.filter((item) => item.id !== id));
                messageApi.success('Đã xóa khỏi watchlist');
            },
        });
    };

    return (
        <>
            {contextHolder}

            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <Title level={2} className={styles.title}>
                            Danh sách đấu giá đang theo dõi
                        </Title>
                    </div>

                    <Badge count={watchlist.length} color="#6366f1">
                        <HeartFilled className={styles.heartIcon} />
                    </Badge>
                </div>

                {watchlist.length === 0 ? (
                    <div className={styles.emptyWrapper}>
                        <Empty description="Chưa có đấu giá nào trong watchlist" />
                    </div>
                ) : (
                    <Row gutter={[24, 24]}>
                        {watchlist.map((item) => (
                            <Col xs={24} key={item.id}>
                                <Card className={styles.card}>
                                    <div className={styles.cardContent}>
                                        {/* IMAGE */}
                                        <div className={styles.imageWrapper}>
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                preview={false}
                                                className={styles.image}
                                            />
                                        </div>

                                        {/* INFO */}
                                        <div className={styles.info}>
                                            <div>
                                                <Title level={4} className={styles.itemTitle}>
                                                    {item.title}
                                                </Title>

                                                <Space size={10} wrap>
                                                    <Tag color="blue">
                                                        Current Bid: {item.currentBid}
                                                    </Tag>

                                                    <Tag color="purple">
                                                        {item.bids} bids
                                                    </Tag>
                                                </Space>

                                                <div className={styles.time}>
                                                    <ClockCircleOutlined />
                                                    <span>{item.endTime}</span>
                                                </div>
                                            </div>

                                            {/* ACTIONS */}
                                            <Space size={12} wrap>
                                                <Button
                                                    type="primary"
                                                    icon={<EyeOutlined />}
                                                    className={styles.viewBtn}
                                                >
                                                    Xem thêm
                                                </Button>

                                                <Button
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleRemove(item.id)}
                                                >
                                                    Xóa
                                                </Button>
                                            </Space>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </>
    );
};

export default WatchlistPage;