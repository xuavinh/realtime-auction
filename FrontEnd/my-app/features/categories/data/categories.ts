import { getCategories, Category } from "@/features/categories/services/category.service";

export type CategoryWithMeta = Category & {
    products: {
        id: number;
        title: string;
        description: string;
        image: string;
    }[];
};

const categoriesData = async (): Promise<CategoryWithMeta[]> => {
    const categories = await getCategories();

    return categories.map((cat) => ({
        ...cat,
        products: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            title: `${cat.name} ${i + 1}`,
            description: `Danh sách đấu giá thuộc ${cat.name}`,
            image:
                "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png",
        })),
    }));
};

export default categoriesData;