import { notFound } from "next/navigation";

import CategoryPage from "@/features/categories/components/CategoryPage";
import { getCategories } from "@/features/categories/services/category.service";
import { listAuctions } from "@/features/auction/services/auction.service";

export default async function Page({
    params,
}: {
    params: { slug: string };
}) {
    const { slug } = params;

    // 1. lấy categories từ backend
    const categories = await getCategories();

    // 2. tìm category theo slug
    const category = categories.find(
        (c) => c.slug === slug
    );

    if (!category) {
        notFound();
    }

    // 3. lấy auctions theo category
    const auctionRes = await listAuctions({
        category_id: category.id,
        page: 1,
        limit: 100,
    });

    return (
        <CategoryPage
            categoryName={category.name}
            auctions={auctionRes.data}
        />
    );
}