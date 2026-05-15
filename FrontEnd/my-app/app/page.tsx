'use client'
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Link from "next/link";
import AuctionCard from "@/features/auction/components/AuctionCard";

import home from "./page.module.css";
import Carousel from "antd/es/carousel";

const HOME_AUCTIONS = [
  {
    id: "1",
    title: "Nhẫn Kim Cương Thiên Nhiên 18K",
    image:
      "https://caohungdiamond.com/wp-content/uploads/2023/06/hai-vien-kim-cuong-do-tinh-khiet-cao.jpg",
    currentPrice: 245000000,
    endTime: "02:15:30",
    bidCount: 120,
    isLive: true,
  },
  {
    id: "2",
    title: "Đồng Hồ Cơ Cao Cấp Phiên Bản Giới Hạn",
    image:
      "https://caohungdiamond.com/wp-content/uploads/2023/06/hai-vien-kim-cuong-do-tinh-khiet-cao.jpg",
    currentPrice: 180000000,
    endTime: "01:42:18",
    bidCount: 86,
    isLive: true,
  },
  {
    id: "3",
    title: "Tranh Nghệ Thuật Sưu Tầm",
    image:
      "https://caohungdiamond.com/wp-content/uploads/2023/06/hai-vien-kim-cuong-do-tinh-khiet-cao.jpg",
    currentPrice: 97000000,
    endTime: "03:05:44",
    bidCount: 52,
    isLive: true,
  },
  {
    id: "4",
    title: "Túi Xách Hàng Hiệu Chính Hãng",
    image:
      "https://caohungdiamond.com/wp-content/uploads/2023/06/hai-vien-kim-cuong-do-tinh-khiet-cao.jpg",
    currentPrice: 128000000,
    endTime: "00:58:09",
    bidCount: 64,
    isLive: true,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans">
      <main className={home.main}>
        <div className={home.container}>
          <div className={home.banner_left}>
            <Button variant="danger" disabled style={{ pointerEvents: "none", opacity: 1 }}>
              LIVE ĐẤU GIÁ
            </Button>
            <h1>
              Nền Tảng Đấu Giá <br />
              <span className="text-orange-500">Trực Tuyến</span><br />
              Hàng Đấu Việt Nam
            </h1>
            <p>
              Tham gia hàng ngàn phiên đấu giá uy tín, an toàn và minh bạch.<br />
              Sản phẩm đa dạng từ trang sức, nghệ thuật đến bất động sản.
            </p>
            <Navbar className="mt-3">
              <Form>
                <InputGroup className={home.search}>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm sản phẩm đấu giá..."
                  />
                  <Button variant="primary" type="submit" className="ms-3">
                    Tìm kiếm
                  </Button>
                </InputGroup>
              </Form>
            </Navbar>
            <ul className={home.stats}>
              <li>
                <span>2.500+</span><br />
                Phiên đấu giá
              </li>
              <li>
                <span>50.000+</span><br />
                Người dùng
              </li>
              <li>
                <span>99%</span><br />
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
                    <img src={src} className={home.carousel_image} />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </div>
      </main>

      <div className={home.list_auction}>
        <div className={home.list_header}>
          <div>
            <span>Đang diễn ra</span>
            <h2>Phiên đấu giá trực tiếp</h2>
          </div>
          <Link href="/auction" className={home.view_all}>
            Xem tất cả
          </Link>
        </div>
        <div className={home.auction_grid}>
          {HOME_AUCTIONS.map((item) => (
            <AuctionCard key={item.id} {...item} />
          ))}
        </div>
      </div>
      <div className={home.category_section}>
        <div className={home.category_header}>
          <div>
            <h2>Danh Mục Đấu Giá</h2>
            <p>Khám phá hàng ngàn sản phẩm qua các danh mục phong phú.</p>
          </div>
        </div>

        <ul className={home.category_list}>
          <li>
            Điện tử
            <span>342 sản phẩm</span>
            <Link href="/categories/electronics" className={home.view_all}>
              Xem tất cả
            </Link>
          </li>

          <li>
            Thời trang
            <span>128 sản phẩm</span>
            <Link href="/categories/fashion" className={home.view_all}>
              Xem tất cả
            </Link>
          </li>

          <li>
            Xe cộ
            <span>89 sản phẩm</span>
            <Link href="/categories/vehicles" className={home.view_all}>
              Xem tất cả
            </Link>
          </li>

          <li>
            Bất động sản
            <span>56 sản phẩm</span>
            <Link href="/categories/real-estate" className={home.view_all}>
              Xem tất cả
            </Link>
          </li>

          <li>
            Nghệ thuật
            <span>73 sản phẩm</span>
            <Link href="/categories/arts" className={home.view_all}>
              Xem tất cả
            </Link>
          </li>

          <li>
            Đồ cổ
            <span>45 sản phẩm</span>
            <Link href="/categories/antiques" className={home.view_all}>
              Xem tất cả
            </Link>
          </li>
        </ul>
      </div>

      <div className={home.how_section}>
        <div className={home.how_header}>
          <h2>Cách thức hoạt động</h2>
          <p>Chỉ 4 bước đơn giản để tham gia đấu giá trực tuyến</p>
        </div>

        <ul className={home.step_grid}>
          <li>
            <span className={home.step_number}>01</span>
            <h3>Đăng Ký Tài Khoản</h3>
            <p>Tạo tài khoản miễn phí, xác minh thông tin cá nhân nhanh chóng và an toàn trong vài phút.</p>
          </li>

          <li>
            <span className={home.step_number}>02</span>
            <h3>Tìm Kiếm & Chọn Sản Phẩm</h3>
            <p>Duyệt qua hàng ngàn sản phẩm đa dạng, sử dụng bộ lọc thông minh để tìm kiếm nhanh chóng và dễ dàng.</p>
          </li>

          <li>
            <span className={home.step_number}>03</span>
            <h3>Đặt Giá & Trả Thầu</h3>
            <p>Đặt giá theo thời gian thực, nhận thông báo khi có người trả giá cao hơn.</p>
          </li>

          <li>
            <span className={home.step_number}>04</span>
            <h3>Thanh Toán & Nhận Hàng</h3>
            <p>Thanh toán an toàn, giao hàng nhanh chóng và hỗ trợ tận tâm.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
