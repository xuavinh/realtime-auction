import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_STORAGE_KEYS } from "./features/auth/constants/storage";

export function middleware(request: NextRequest) {
    const token = request.cookies.get(AUTH_STORAGE_KEYS.accessToken)?.value;

    const { pathname } = request.nextUrl;

    // Các đường dẫn cần bảo vệ yêu cầu đăng nhập
    const isProtected = 
        pathname.startsWith("/new-auction") || 
        pathname.startsWith("/watchlist") ||
        pathname.startsWith("/users");

    if (isProtected && !token) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/new-auction/:path*", 
        "/watchlist/:path*", 
        "/users/:path*"
    ],
};
