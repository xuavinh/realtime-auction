import styles from "./Footer.module.css";
import { MailOutlined, PhoneOutlined, PushpinOutlined } from "@ant-design/icons";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.top}>
                    <div className={styles.column}>
                        <img src="/logo.png" alt="BidViet Logo" className={styles.logo} />
                        <p className={styles.description}>
                            Nền tảng đấu giá trực tuyến uy tín hàng đầu Việt Nam
                        </p>
                        <p className={styles.contactItem}>
                            <PhoneOutlined />
                            <span>1900 9999</span>
                        </p>
                        <p className={styles.contactItem}>
                            <MailOutlined />
                            <span>support@bidviet.vn</span>
                        </p>
                        <p className={styles.contactItem}>
                            <PushpinOutlined />
                            <span>123 Đường Lê Duẩn, TP. HCM</span>
                        </p>
                    </div>

                    <div className={styles.column}>
                        <h5>Khám Phá</h5>
                        <ul className={styles.linkList}>
                            <li><a href="#">Đấu giá đang diễn ra</a></li>
                            <li><a href="#">Đấu giá sắp tới</a></li>
                            <li><a href="#">Kết quả đấu giá</a></li>
                            <li><a href="#">Danh mục sản phẩm</a></li>
                            <li><a href="#">Tin tức đấu giá</a></li>
                        </ul>
                    </div>

                    <div className={styles.column}>
                        <h5>Hỗ Trợ</h5>
                        <ul className={styles.linkList}>
                            <li><a href="#">Hướng dẫn đấu giá</a></li>
                            <li><a href="#">Câu hỏi thường gặp</a></li>
                            <li><a href="#">Quy định & Điều khoản</a></li>
                            <li><a href="#">Chính sách bảo mật</a></li>
                            <li><a href="#">Liên hệ hỗ trợ</a></li>
                        </ul>
                    </div>

                    <div className={styles.column}>
                        <h5>Cam Kết BidViet</h5>
                        <ul className={styles.featureList}>
                            <li>
                                <span>Quy trình đấu giá minh bạch, công khai </span>
                            </li>
                            <li>
                                <span>Thanh toán an toàn, bảo mật giao dịch</span>
                            </li>
                            <li>
                                <span>Xác thực tài khoản trước khi đấu giá</span>
                            </li>
                            <li>
                                <span>Hỗ trợ nhanh khi có tranh chấp hoặc sự cố</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className={styles.divider} />

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        &copy; 2026 BidViet. All rights reserved.
                    </p>

                    <div className={styles.socials}>
                        <a href="#"><i className="fab fa-facebook"></i>Facebook</a>
                        <a href="#"><i className="fab fa-youtube"></i>Youtube</a>
                        <a href="#"><i className="fab fa-tiktok"></i>Tiktok</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
