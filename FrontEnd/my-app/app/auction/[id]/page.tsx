import AuctionLayout
    from "@/features/auction/components/AuctionLayout";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function AuctionPage({
    params,
}: Props) {
    const { id } = await params;

    return (
        <AuctionLayout
            auctionId={Number(id)}
        />
    );
}