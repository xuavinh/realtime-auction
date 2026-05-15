import AuctionList from "@/features/auction/components/AuctionList";

export default function AuctionPage() {
    return (
        <div style={{ margin: "30px 108.4px" }}>
            <h1 style={{ marginBottom: 20 }}>Đấu giá đang diễn ra</h1>
            <AuctionList />
        </div>
    );
}