import CategoryPage from "@/features/categories/components/CategoryPage";
import { getCategories, type Category } from "@/features/categories/services/category.service";
import { listAuctions, getAuctionById, type AuctionListItem } from "@/features/auction/services/auction.service";

// Thuật toán đệ quy tìm kiếm danh mục theo slug trong cây danh mục phân cấp
function findCategoryBySlug(categories: Category[], slug: string): Category | null {
    if (!categories || !Array.isArray(categories)) return null;
    for (const cat of categories) {
        if (cat.slug === slug) {
            return cat;
        }
        if (cat.children && cat.children.length > 0) {
            const found = findCategoryBySlug(cat.children, slug);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }> | { slug: string };
}) {
    // Kể từ Next.js 15+, params là một Promise và bắt buộc phải await trước khi truy xuất thuộc tính
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    let category: Category | null = null;
    let auctions: AuctionListItem[] = [];
    let isApiError = false;

    try {
        // 1. lấy categories từ backend
        const categories = await getCategories();
        
        // 2. tìm category đệ quy theo slug
        category = findCategoryBySlug(categories, slug);

        if (category) {
            // 3. lấy auctions theo category
            const auctionRes = await listAuctions({
                category_id: category.id,
                page: 1,
                limit: 100,
                sort: "newest",
            });
            const rawAuctions = auctionRes?.data || [];
            
            // Enrich dữ liệu start_time cho các sản phẩm PENDING
            auctions = await Promise.all(
                rawAuctions.map(async (auction) => {
                    if (auction.status === "PENDING") {
                        try {
                            const detail = await getAuctionById(auction.id);
                            return { ...auction, start_time: detail.start_time };
                        } catch {
                            return auction;
                        }
                    }
                    return auction;
                })
            );
        }
    } catch (error) {
        console.error("Error in Category Page server component:", error);
        isApiError = true;
    }

    // Nếu không tìm thấy danh mục trong database hoặc gặp lỗi API kết nối
    if (!category) {
        return (
            <div 
                style={{ 
                    margin: "60px auto", 
                    maxWidth: "600px",
                    textAlign: "center", 
                    padding: "40px", 
                    background: "#ffffff", 
                    borderRadius: "16px", 
                    border: "1px solid #eaeaea",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
                }}
            >
                <span style={{ fontSize: "64px", display: "block", marginBottom: "20px" }}>📦</span>
                <h1 style={{ color: "#ff4d4f", fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
                    {isApiError ? "Lỗi Kết Nối Máy Chủ" : "Danh Mục Chưa Sẵn Sàng"}
                </h1>
                <p style={{ color: "#666", fontSize: "15px", lineHeight: "1.6", marginBottom: "28px" }}>
                    {isApiError ? (
                        "Không thể kết nối tới máy chủ Backend để lấy danh mục. Vui lòng đảm bảo máy chủ Go Backend đang chạy ổn định."
                    ) : (
                        <>
                            Danh mục với mã đường dẫn <strong>"{slug || "unknown"}"</strong> hiện chưa được khởi tạo hoặc chưa có dữ liệu đấu giá trong cơ sở dữ liệu của bạn.
                        </>
                    )}
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                    <a 
                        href="/" 
                        style={{ 
                            padding: "10px 24px", 
                            background: "#1677ff", 
                            color: "#fff", 
                            borderRadius: "8px", 
                            textDecoration: "none", 
                            fontWeight: "bold",
                            transition: "background 0.3s"
                        }}
                    >
                        Quay lại Trang Chủ
                    </a>
                    <a 
                        href="/auction" 
                        style={{ 
                            padding: "10px 24px", 
                            background: "#f5f5f5", 
                            color: "#333", 
                            borderRadius: "8px", 
                            textDecoration: "none", 
                            fontWeight: "bold",
                            border: "1px solid #d9d9d9",
                            transition: "background 0.3s"
                        }}
                    >
                        Xem Tất Cả Đấu Giá
                    </a>
                </div>
            </div>
        );
    }

    return (
        <CategoryPage
            categoryName={category.name}
            auctions={auctions}
        />
    );
}