import AuctionList from "@/features/auction/components/AuctionList";

export default function AuctionPage() {
    return (
        <div className="max-w-[1320px] mx-auto my-8 px-3 md:px-12 xl:px-0">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">Tất cả phiên đấu giá</h1>
            <AuctionList />
        </div>
    );
}