"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {

    const router = useRouter();

    useEffect(() => {

        const token =
            localStorage.getItem(
                "accessToken"
            );

        if (!token) {
            router.push("/login");
        }

    }, []);

    return (
        <div>
            Dashboard
        </div>
    );
}