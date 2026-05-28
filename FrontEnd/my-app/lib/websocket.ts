import {
    AUTH_STORAGE_KEYS,
} from "@/features/auth/constants/storage";

export function connectAuctionWS(
    auctionId: number,
    onMessage: (
        data: any
    ) => void
) {

    const token =
        localStorage.getItem(
            AUTH_STORAGE_KEYS.accessToken
        ) || "";

    const ws =
        new WebSocket(
            `${process.env.NEXT_PUBLIC_WS_URL}/ws/auctions/${auctionId}?token=${token}`
        );

    ws.onopen = () => {
        console.log(
            "WS connected"
        );
    };

    ws.onmessage = (
        event
    ) => {

        try {

            const data =
                JSON.parse(
                    event.data
                );

            console.log(
                "WS message:",
                data
            );

            onMessage(data);

        } catch (error) {

            console.error(
                error
            );
        }
    };

    ws.onerror = (
        error
    ) => {

        console.error(
            "WS error:",
            error
        );
    };

    ws.onclose = () => {

        console.log(
            "WS disconnected"
        );
    };

    return ws;
}