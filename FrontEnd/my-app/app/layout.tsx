import type { Metadata } from "next";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import ConditionalLayout from "@/components/layout/ConditionalLayout";

export const metadata: Metadata = {
  title: "BidViet",
  description: "BidViet - Nền tảng đấu giá trực tuyến hàng đầu tại Việt Nam. Khám phá hàng ngàn sản phẩm đa dạng, từ đồ điện tử, thời trang đến đồ gia dụng, tất cả đều được bán với giá hấp dẫn. Tham gia đấu giá ngay hôm nay để sở hữu những món hàng yêu thích với giá tốt nhất!",
  keywords: "BidViet, đấu giá trực tuyến, sản phẩm đa dạng, đồ điện tử, thời trang, đồ gia dụng, giá hấp dẫn, tham gia đấu giá",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"></link>
      </head>
      <body className="min-h-full flex flex-col">
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
