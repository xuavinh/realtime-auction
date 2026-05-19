import api from "@/lib/axios";

export type Category = {
    id: number;
    name: string;
    slug: string;
};

const apiGet = async <T>(url: string): Promise<T> => {
    const res = await api.get(url);
    return res.data;
};

export const getCategories = () =>
    apiGet<Category[]>("/categories");