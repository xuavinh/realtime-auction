import api from "@/lib/axios";

export type Category = {
    id: number;
    name: string;
    slug: string;
    children: Category[];
};

type ApiResponse<T> = {
    data: T;
};

export const getCategories = async () => {
    const res = await api.get<ApiResponse<Category[]>>("/categories");
    return res.data.data;
};