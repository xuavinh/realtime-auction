import api from "@/lib/axios";

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
    category_id?: number | null;
    start_price: number;
    min_bid_increment: number;
    start_time: string;
    end_time: string;
};

export type UpdateAuctionPayload = {
    title?: string;
    description?: string;
    category_id?: number | null;
    start_price?: number;
    min_bid_increment?: number;
    start_time?: string;
    end_time?: string;
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

export type AuctionListItem = {
    id: number;
    title: string;
    category?: AuctionCategoryRef | null;
    current_price: number;
    status: string;
    start_time?: string;
    end_time: string;
    primary_image_url?: string | null;
};

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
    url?: string | null
) {
    if (!url) {
        return "";
    }

    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
        return url;
    }

    try {
        const origin =
            new URL(apiUrl).origin;

        return `${origin}${url.startsWith("/")
            ? url
            : `/${url}`
            }`;
    }
    catch {
        return url;
    }
}
export type ListAuctionsParams = {
    page?: number;
    limit?: number;
    status?: string;
    category_id?: number;
    min_price?: number;
    max_price?: number;
    sort?: "newest" | "price_asc" | "price_desc" | "ending_soon" | "relevance";
    search?: string;
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

export async function updateAuction(
    auctionId: number,
    payload: UpdateAuctionPayload
) {
    const res =
        await api.put<ApiDataResponse<Auction>>(
            `/auctions/${auctionId}`,
            payload
        );

    return res.data.data;
}

type ApiMessageResponse = {
    message: string;
};

export async function deleteAuction(
    auctionId: number
) {
    const res =
        await api.delete<ApiMessageResponse>(
            `/auctions/${auctionId}`
        );

    return res.data.message;
}

export async function deleteAuctionImage(
    auctionId: number,
    imageId: number
) {
    await api.delete(
        `/auctions/${auctionId}/images/${imageId}`
    );
}

export async function listMyAuctions(
    params?: ListAuctionsParams
) {
    const res =
        await api.get<
            ApiPaginatedResponse<
                AuctionListItem[]
            >
        >(
            "/auctions/me",
            {
                params,
            }
        );

    return res.data;
}
export type BidItem = {
    id: number;
    bidder_name: string;
    bid_price: number;
    auction_version: number;
    created_at: string;
};

export type PlaceBidPayload = {
    bid_price: number;
};

export type PlaceBidResponse = {
    bid_id: number;
    current_price: number;
    version: number;
    end_time: string;
};
export async function listAuctionBids(
    auctionId: number,
    page = 1,
    limit = 20
) {

    const res =
        await api.get<
            ApiPaginatedResponse<
                BidItem[]
            >
        >(
            `/auctions/${auctionId}/bids`,
            {
                params: {
                    page,
                    limit,
                },
            }
        );

    return res.data;
}
export async function placeBid(
    auctionId: number,
    payload: PlaceBidPayload
) {

    const res =
        await api.post<
            ApiDataResponse<
                PlaceBidResponse
            >
        >(
            `/auctions/${auctionId}/bids`,
            payload,
            {
                headers: {
                    "Idempotency-Key":
                        crypto.randomUUID(),
                },
            }
        );

    return res.data.data;
}