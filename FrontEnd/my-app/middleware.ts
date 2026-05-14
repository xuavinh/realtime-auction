import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

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