import { notFound } from "next/navigation";

import CategoryPage from "../../components/categories/CategoryPage";

import categoriesData from "@/data/categories";

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {

    const { slug } = await params;

    const category =
        categoriesData[
        slug as keyof typeof categoriesData
        ];

    if (!category) {
        notFound();
    }

    return (
        <CategoryPage
            categoryName={category.name}
            products={category.products}
        />
    );
}