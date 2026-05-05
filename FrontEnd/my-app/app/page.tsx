import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import home from "./styles/home.module.css";

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
            <div className={home.card}>
              <div className={home.image_wrapper}>
                <span className={home.live_badge}>LIVE</span>
                <img
                  src="https://caohungdiamond.com/wp-content/uploads/2023/06/hai-vien-kim-cuong-do-tinh-khiet-cao.jpg"
                  className={home.banner_image}
                />
              </div>

              <div className={home.card_body}>
                <h3>Nhẫn Kim Cương</h3>

                <div className={home.info}>
                  <div>
                    <span>Giá hiện tại</span>
                    <p className={home.price}>245.000.000đ</p>
                  </div>

                  <div>
                    <span>Kết thúc sau</span>
                    <p className={home.time}>02:15:30</p>
                  </div>
                </div>

                <Button variant="danger" className={home.bid_btn}>
                  Tham gia đấu giá
                </Button>

                <p className={home.users}>120 người đang đấu giá</p>
              </div>
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
          <a href="#">Xem tất cả</a>
        </div>
        <div className={home.auction_grid}>
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className={home.card}>
              <div className={home.image_wrapper}>
                <span className={home.live_badge}>LIVE</span>
                <img
                  src="https://caohungdiamond.com/wp-content/uploads/2023/06/hai-vien-kim-cuong-do-tinh-khiet-cao.jpg"
                  className={home.banner_image}
                />
              </div>

              <div className={home.card_body}>
                <h3>Nhẫn Kim Cương</h3>

                <div className={home.info}>
                  <div>
                    <span>Giá hiện tại</span>
                    <p className={home.price}>245.000.000đ</p>
                  </div>

                  <div>
                    <span>Kết thúc sau</span>
                    <p className={home.time}>02:15:30</p>
                  </div>
                </div>
                <p className={home.users}>120 người đang đấu giá</p>

                <button className={home.bid_btn_alt}>
                  Đặt giá
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={home.category_section}>
        <div className={home.category_header}>
          <div>
            <h2>Danh Mục Đấu Giá</h2>
            <p>Khám phá hàng ngàn sản phẩm qua các danh mục phong phú.</p>
          </div>
          <a href="#">Xem tất cả</a>
        </div>

        <ul className={home.category_list}>
          <li>
            Trang sức
            <span>342 sản phẩm</span>
            <a href="#">Xem tất cả</a>
          </li>

          <li>
            Nghệ thuật
            <span>128 sản phẩm</span>
            <a href="#">Xem tất cả</a>
          </li>

          <li>
            Bất động sản
            <span>89 sản phẩm</span>
            <a href="#">Xem tất cả</a>
          </li>

          <li>
            Ô tô & Xe máy
            <span>56 sản phẩm</span>
            <a href="#">Xem tất cả</a>
          </li>

          <li>
            Đồ cổ & Sưu tầm
            <span>73 sản phẩm</span>
            <a href="#">Xem tất cả</a>
          </li>

          <li>
            Rượu vang & Đồ uống
            <span>45 sản phẩm</span>
            <a href="#">Xem tất cả</a>
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
