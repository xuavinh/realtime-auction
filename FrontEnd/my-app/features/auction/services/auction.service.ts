import api from "@/lib/axios";

const API_BASE_URL =
    api.defaults.baseURL ?? "";

const API_ORIGIN = API_BASE_URL
    ? new URL(API_BASE_URL).origin
    : "";

export type AuctionCategory = {
    id: number;
    name: string;
    slug: string;
    children: AuctionCategory[];
};

export type AuctionCategoryRef = {
    id: number;
    name: string;
    slug: string;
}

export type CreateAuctionPayload = {
    title: string;
    description?: string;
    category_id?: number;
    start_price: number;
    min_bid_increment: number;
    start_time: string;
    end_time: string;
};

export type AuctionImage = {
    id: number;
    url: string;
    filename: string;
    size_bytes: number;
    mime_type: string;
    sort_order: number;
    is_primary: boolean;
    created_at: string;
};

export type Auction = {
    id: number;
    title: string;
    description: string;
    category_id?: number | null;
    category?: AuctionCategoryRef | null;
    start_price: number;
    current_price: number;
    min_bid_increment: number;
    start_time: string;
    end_time: string;
    status: string;
    created_by: number;
    winner_id?: number | null;
    primary_image_url?: string | null;
    images?: AuctionImage[];
    created_at: string;
    updated_at: string;
};

type PaginationMeta = {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

type ApiPaginatedResponse<T> = {
    data: T;
    pagination: PaginationMeta;
    server_now: string;
};

type ApiDataResponse<T> = {
    data: T;
};

export async function listAuctionCategories() {
    const res =
        await api.get<ApiDataResponse<AuctionCategory[]>>(
            "/categories"
        );

    return res.data.data;
}

export async function createAuction(
    payload: CreateAuctionPayload
) {
    const res =
        await api.post<ApiDataResponse<Auction>>(
            "/auctions",
            payload
        );

    return res.data.data;
}

export async function uploadAuctionImage(
    auctionId: number,
    file: File
) {
    const formData = new FormData();

    formData.append("file", file);

    const res =
        await api.post<ApiDataResponse<AuctionImage>>(
            `/auctions/${auctionId}/images`,
            formData
        );

    return res.data.data;
}

export async function getAuctionById(
    auctionId: number
) {
    const res =
        await api.get<ApiDataResponse<Auction>>(
            `/auctions/${auctionId}`
        );
    return res.data.data;
}

export function resolveAuctionImageUrl(
    url: string
) {
    if (!url) {
        return "";
    }

    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    if (!API_ORIGIN) {
        return url;
    }

    return new URL(url, API_ORIGIN).toString();
}

export type ListAuctionsParams = {
    page?: number;
    limit?: number;
    status?: string;
    category_id?: number;
    min_price?: number;
    max_price?: number;
    sort?: "newest" | "price_asc" | "price_desc" | "ending_soon";
}

export async function listAuctions(
    params?: ListAuctionsParams
) {
    const res =
        await api.get<ApiPaginatedResponse<Auction[]>>(
            "/auctions",
            { params }
        );
    return res.data;
}