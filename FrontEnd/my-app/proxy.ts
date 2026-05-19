import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_STORAGE_KEYS } from "./features/auth/constants/storage";

export function proxy(request: NextRequest) {
    const token =
        request.cookies.get(
            AUTH_STORAGE_KEYS.accessToken
        )?.value;

    const isProtected = request.nextUrl.pathname.startsWith("/new-auction");

    if (isProtected && !token) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/new-auction/:path*"],
};
