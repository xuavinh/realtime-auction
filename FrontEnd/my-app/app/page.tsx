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
        </div>
      </main>
    </div>
  );
}
