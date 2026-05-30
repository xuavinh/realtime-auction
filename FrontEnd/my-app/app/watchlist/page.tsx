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

            <div className="max-w-[1320px] mx-auto my-8 px-3 md:px-12 xl:px-0 min-h-screen">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                            Danh sách đấu giá đang theo dõi
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Quản lý các phiên đấu giá bạn quan tâm và nhận thông tin cập nhật thời gian thực
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl px-4 py-2.5 w-fit">
                        <HeartFilled className="text-indigo-500 text-xl" />
                        <span className="text-sm font-bold text-indigo-700">
                            Đang quan tâm: {watchlist.length} sản phẩm
                        </span>
                    </div>
                </div>

                {watchlist.length === 0 ? (
                    <div className="min-h-[50vh] flex justify-center items-center bg-white/50 backdrop-blur-md rounded-3xl border border-slate-100 shadow-sm p-10">
                        <Empty description={<span className="text-slate-400 font-semibold">Chưa có đấu giá nào trong danh sách theo dõi của bạn</span>} />
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {watchlist.map((item) => (
                            <div 
                                key={item.id}
                                className="bg-white/90 backdrop-blur-xl border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row gap-6 items-center"
                            >
                                {/* IMAGE */}
                                <div className="w-full md:w-56 h-40 rounded-2xl overflow-hidden shrink-0 relative group shadow-inner bg-slate-50">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-extrabold text-white shadow-sm flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                        ĐANG THEO DÕI
                                    </div>
                                </div>

                                {/* INFO */}
                                <div className="flex-1 w-full flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                                    <div className="space-y-3.5">
                                        <h3 className="text-xl font-extrabold text-slate-800 leading-snug hover:text-indigo-600 transition-colors">
                                            {item.title}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-100 shadow-sm">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Giá thầu: {item.currentBid}
                                            </span>

                                            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-indigo-100 shadow-sm">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                {item.bids} lượt trả giá
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 bg-rose-50/80 px-3 py-1.5 rounded-xl w-fit border border-rose-100/50">
                                            <ClockCircleOutlined className="text-rose-500 text-sm" />
                                            <span>Kết thúc: {item.endTime}</span>
                                        </div>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="flex items-center gap-3 shrink-0 w-full xl:w-auto">
                                        <Button
                                            type="primary"
                                            icon={<EyeOutlined />}
                                            className="flex-1 xl:flex-none bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl h-10 px-5 font-bold shadow-sm hover:shadow-indigo-100 hover:shadow-lg transition-all"
                                        >
                                            Xem chi tiết
                                        </Button>

                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemove(item.id)}
                                            className="flex-1 xl:flex-none border-slate-200 hover:border-red-500 hover:text-red-500 rounded-xl h-10 px-4 font-bold transition-all"
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default WatchlistPage;