"use client";

import { useEffect, useState } from "react";

import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Link from "next/link";

import Carousel from "antd/es/carousel";

import AuctionCard from "@/features/auction/components/AuctionCard";
import {
  listAuctions,
  getAuctionById,
  resolveAuctionImageUrl,
  type Auction,
} from "@/features/auction/services/auction.service";

import home from "./page.module.css";

export default function Home() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        const res = await listAuctions({
          page: 1,
          limit: 8,
          sort: "newest",
        });
        const rawAuctions = res.data;

        // Enrich start_time cho các sản phẩm PENDING
        const enriched = await Promise.all(
          rawAuctions.map(async (item) => {
            if (item.status === "PENDING") {
              try {
                const detail = await getAuctionById(item.id);
                return { ...item, start_time: detail.start_time };
              } catch {
                return item;
              }
            }
            return item;
          })
        );

        if (!cancelled) {
          setAuctions(enriched);
        }
      } catch (err) {
        console.error("Failed to load auctions:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans">
      <main className={home.main}>
        <div className={home.container}>
          <div className={home.banner_left}>
            <Button
              variant="danger"
              disabled
              style={{ pointerEvents: "none", opacity: 1 }}
            >
              LIVE ĐẤU GIÁ
            </Button>

            <h1>
              Nền Tảng Đấu Giá <br />
              <span className="text-orange-500">
                Trực Tuyến
              </span>
              <br />
              Hàng Đấu Việt Nam
            </h1>

            <p>
              Tham gia hàng ngàn phiên đấu giá uy tín, an toàn và minh bạch.
              <br />
              Sản phẩm đa dạng từ trang sức, nghệ thuật đến bất động sản.
            </p>

            <Navbar className="mt-3 p-0 w-full">
              <Form className="w-full">
                <InputGroup className={`${home.search} w-full`}>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm sản phẩm đấu giá..."
                  />
                  <Button
                    variant="primary"
                    type="submit"
                    className="ms-3"
                  >
                    Tìm kiếm
                  </Button>
                </InputGroup>
              </Form>
            </Navbar>

            <ul className={home.stats}>
              <li>
                <span>2.500+</span>
                <br />
                Phiên đấu giá
              </li>
              <li>
                <span>50.000+</span>
                <br />
                Người dùng
              </li>
              <li>
                <span>99%</span>
                <br />
                An toàn & Tin cậy
              </li>
            </ul>
          </div>

          <div className={home.banner_right}>
            <div className={home.carousel_wrapper}>
              <Carousel autoplay dots>
                {[
                  "https://caohungdiamond.com/wp-content/uploads/2023/06/hai-vien-kim-cuong-do-tinh-khiet-cao.jpg",
                  "https://file4.batdongsan.com.vn/2021/07/25/20210725173426-3b90.jpg",
                  "https://luxurylaunches.com/wp-content/uploads/2021/10/farnova-hypercar-5-770x571.jpg",
                ].map((src, index) => (
                  <div key={index}>
                    <img
                      src={src}
                      className={home.carousel_image}
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </div>
      </main>

      {/* ================= AUCTIONS ================= */}
      <div className={home.list_auction}>
        <div className={home.list_header}>
          <div>
            <span>Đa dạng & Phong phú</span>
            <h2>Tất cả phiên đấu giá</h2>
          </div>

          <Link href="/auction" className={home.view_all}>
            Xem tất cả
          </Link>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className={home.auction_grid}>
            {auctions.map((auction) => {
              const imageUrl =
                auction.primary_image_url ||
                auction.images?.[0]?.url ||
                "";

              return (
                <AuctionCard
                  key={auction.id}
                  id={String(auction.id)}
                  title={auction.title}
                  image={resolveAuctionImageUrl(imageUrl)}
                  currentPrice={auction.current_price}
                  startTime={auction.start_time}
                  endTime={auction.end_time}
                  status={auction.status}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ================= CATEGORY ================= */}
      <div className={home.category_section}>
        <div className={home.category_header}>
          <div>
            <h2>Danh Mục Đấu Giá</h2>
            <p>
              Khám phá hàng ngàn sản phẩm qua các danh mục phong phú.
            </p>
          </div>
        </div>

        <ul className={home.category_list}>
          <li>
            Điện tử <span>Linh kiện điện tử, thiết bị điện tử, điện thoại, máy tính</span>
            <Link
              href="/categories/dien-tu"
              className={home.view_all}
            >
              Xem tất cả
            </Link>
          </li>

          <li>
            Thời trang <span>Quần áo, giày dép, phụ kiện thời trang</span>
            <Link
              href="/categories/thoi-trang"
              className={home.view_all}
            >
              Xem tất cả
            </Link>
          </li>

          <li>
            Xe cộ <span>Ô tô, xe máy, phụ tùng xe</span>
            <Link
              href="/categories/xe-co"
              className={home.view_all}
            >
              Xem tất cả
            </Link>
          </li>

          <li>
            Bất động sản <span>Nhà nguyên căn, chung cư, đất, căn hộ</span>
            <Link
              href="/categories/bat-dong-san"
              className={home.view_all}
            >
              Xem tất cả
            </Link>
          </li>

          <li>
            Nghệ thuật <span>Đồ nghệ thuật, tranh vẽ, đồ chơi</span>
            <Link href="/categories/nghe-thuat" className={home.view_all}>
              Xem tất cả
            </Link>
          </li>

          <li>
            Đồ cổ <span>Tranh, đồ cổ, hiện vật</span>
            <Link
              href="/categories/do-co"
              className={home.view_all}
            >
              Xem tất cả
            </Link>
          </li>
        </ul>
      </div>

      {/* ================= HOW IT WORKS ================= */}
      <div className={home.how_section}>
        <div className={home.how_header}>
          <h2>Cách thức hoạt động</h2>
          <p>Chỉ 4 bước đơn giản để tham gia đấu giá trực tuyến</p>
        </div>

        <ul className={home.step_grid}>
          <li>
            <span className={home.step_number}>01</span>
            <h3>Đăng Ký Tài Khoản</h3>
            <p>
              Tạo tài khoản miễn phí, xác minh thông tin cá nhân nhanh chóng và an toàn trong vài phút.
            </p>
          </li>

          <li>
            <span className={home.step_number}>02</span>
            <h3>Tìm Kiếm & Chọn Sản Phẩm</h3>
            <p>
              Duyệt qua hàng ngàn sản phẩm đa dạng, sử dụng bộ lọc thông minh để tìm kiếm nhanh chóng và dễ dàng.
            </p>
          </li>

          <li>
            <span className={home.step_number}>03</span>
            <h3>Đặt Giá & Trả Thầu</h3>
            <p>
              Đặt giá theo thời gian thực, nhận thông báo khi có người trả giá cao hơn.
            </p>
          </li>

          <li>
            <span className={home.step_number}>04</span>
            <h3>Thanh Toán & Nhận Hàng</h3>
            <p>
              Thanh toán an toàn, giao hàng nhanh chóng và hỗ trợ tận tâm.
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
}