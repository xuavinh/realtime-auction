"use client";

import React from "react";
import { useCountdown } from "../hooks/useCountdown";

interface Props {
    startTime: string;
    endTime: string;
    status: string;
}

export default function CountdownTimer({ startTime, endTime, status }: Props) {
    const isPending = status === "PENDING";
    const targetTime = isPending ? startTime : endTime;
    
    const { timeLeft, isEnded, isUrgent } = useCountdown(targetTime);

    if (isEnded) {
        if (isPending) {
            return (
                <div className="flex items-center justify-center p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold text-center animate-pulse text-sm">
                    <i className="fa-solid fa-circle-play mr-2"></i>
                    ĐẤU GIÁ ĐANG BẮT ĐẦU! HÃY TẢI LẠI TRANG
                </div>
            );
        }
        return (
            <div className="flex items-center justify-center p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 font-bold text-center animate-pulse text-sm">
                <i className="fa-solid fa-hourglass-end mr-2"></i>
                PHIÊN ĐẤU GIÁ ĐÃ KẾT THÚC
            </div>
        );
    }

    const padZero = (num: number) => String(num).padStart(2, "0");

    const timeBlocks = [
        { label: "Ngày", value: padZero(timeLeft.days) },
        { label: "Giờ", value: padZero(timeLeft.hours) },
        { label: "Phút", value: padZero(timeLeft.minutes) },
        { label: "Giây", value: padZero(timeLeft.seconds) },
    ];

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {isPending ? (
                    <span className="text-sky-400 font-bold flex items-center gap-1.5 animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping"></span>
                        <i className="fa-solid fa-calendar-days"></i> Phiên sắp diễn ra (Bắt đầu sau)
                    </span>
                ) : isUrgent ? (
                    <span className="text-red-400 animate-pulse font-bold flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                        <i className="fa-solid fa-triangle-exclamation"></i> Sắp hết giờ! Đặt giá ngay!
                    </span>
                ) : (
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <i className="fa-solid fa-clock"></i> Thời gian còn lại
                    </span>
                )}
            </div>

            <div className="flex gap-2 items-center">
                {timeBlocks.map((block, idx) => (
                    <React.Fragment key={block.label}>
                        <div className="flex flex-col items-center">
                            {/* Dark Blue Glassmorphism Card */}
                            <div
                                className={`w-14 h-14 flex items-center justify-center rounded-xl font-mono text-2xl font-bold transition-all duration-300 backdrop-blur-md border ${
                                    isPending
                                        ? "bg-[#0f172a]/80 border-sky-500/30 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                                        : isUrgent
                                        ? "bg-red-950/40 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse"
                                        : "bg-[#121926] border-zinc-805/80 text-white"
                                }`}
                            >
                                {block.value}
                            </div>
                            <span className={`text-[10px] mt-1 font-semibold ${isPending ? "text-sky-450" : isUrgent ? "text-red-400" : "text-zinc-500"}`}>
                                {block.label}
                            </span>
                        </div>
                        {idx < 3 && (
                            <span className={`text-xl font-bold font-mono self-start mt-3 ${isPending ? "text-sky-500/30" : isUrgent ? "text-red-550" : "text-zinc-700"}`}>
                                :
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
