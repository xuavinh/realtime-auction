export type Product = {
    id: number;
    title: string;
    description: string;
    image: string;
};

export type Category = {
    id: number;
    name: string;
    slug: string;
    children: Category[];
};