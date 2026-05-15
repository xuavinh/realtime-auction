"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AUTH_STORAGE_KEYS } from "@/features/auth/constants/storage";

export default function Dashboard() {

    const router = useRouter();

    useEffect(() => {

        const token =
            localStorage.getItem(
                AUTH_STORAGE_KEYS.accessToken
            );

        if (!token) {
            router.push("/auth/login");
        }

    }, [router]);

    return (
        <div>
            Dashboard
        </div>
    );
}
