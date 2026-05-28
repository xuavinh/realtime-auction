"use client";

import { useEffect, useState } from "react";

export interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
}

export function useCountdown(endTimeString: string) {
    const calculateTimeLeft = (): TimeLeft => {
        const difference = +new Date(endTimeString) - +new Date();
        let timeLeft: TimeLeft = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            totalMs: difference,
        };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                totalMs: difference,
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMs: 0,
    });

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endTimeString]);

    const isEnded = isMounted && timeLeft.totalMs <= 0;
    const isUrgent = isMounted && timeLeft.totalMs > 0 && timeLeft.totalMs <= 60000; // Dưới 1 phút

    return {
        timeLeft,
        isEnded,
        isUrgent,
    };
}
