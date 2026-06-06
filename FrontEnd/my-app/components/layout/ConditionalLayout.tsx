"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

interface ConditionalLayoutProps {
    children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
    const pathname = usePathname();

    // Kiểm tra xem trang hiện tại có thuộc nhóm trang auth (/auth/login, /auth/register) hay không
    const isAuthPage = pathname ? pathname.startsWith("/auth") : false;

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    );
}
