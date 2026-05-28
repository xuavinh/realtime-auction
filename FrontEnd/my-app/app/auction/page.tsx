import AuctionList from "@/features/auction/components/AuctionList";

export default function AuctionPage() {
    return (
        <div style={{ margin: "30px 108.4px" }}>
            <h1 style={{ marginBottom: 25, fontSize: "28px", fontWeight: 800, color: "#111827" }}>Tất cả phiên đấu giá</h1>
            <AuctionList />
        </div>
    );
}