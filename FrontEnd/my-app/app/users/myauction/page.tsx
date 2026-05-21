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

import styles from './myauction.module.css';

const { Title, Text } = Typography;

const initialWatchlist = [
    {
        id: 1,
        title: 'Rolex Submariner Date 2024',
        image:
            'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1200&auto=format&fit=crop',
        currentBid: '$12,500',
        startTime: '18 May 2026 • 21:30',
        endTime: '20 May 2026 • 21:30',
        status: 'PENDING',
    },
    {
        id: 2,
        title: 'MacBook Pro M4 Max 16 inch',
        image:
            'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=1200&auto=format&fit=crop',
        currentBid: '$3,200',
        startTime: '18 May 2026 • 21:30',
        endTime: '21 May 2026 • 18:00',
        status: 'PENDING',
    },
    {
        id: 3,
        title: 'Nike Air Jordan Retro Chicago',
        image:
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
        currentBid: '$980',
        startTime: '18 May 2026 • 21:30',
        endTime: '22 May 2026 • 10:15',
        status: 'PENDING',
    },
];

const MyAuctionPage = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [watchlist, setWatchlist] = useState(initialWatchlist);

    const handleRemove = (id: number) => {
        Modal.confirm({
            title: 'Xóa khỏi danh sách?',
            content: 'Bạn có chắc muốn xóa đấu giá này?',
            centered: true,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: {
                danger: true,
            },
            onOk: () => {
                setWatchlist((prev) => prev.filter((item) => item.id !== id));
                messageApi.success('Đã xóa khỏi danh sách');
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
                            Danh sách đấu giá của tôi
                        </Title>
                    </div>
                </div>

                {watchlist.length === 0 ? (
                    <div className={styles.emptyWrapper}>
                        <Empty description="Bạn chưa có đấu giá nào" />
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
                                                        Giá thầu hiện tại: {item.currentBid}
                                                    </Tag>
                                                    <Tag>
                                                        Trạng thái: {item.status}
                                                    </Tag>
                                                </Space>
                                                <div className={styles.startTime}>
                                                    <ClockCircleOutlined />
                                                    <span>{item.startTime}</span>
                                                </div>
                                                <div className={styles.endTime}>
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
                                                    Sửa
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

export default MyAuctionPage;