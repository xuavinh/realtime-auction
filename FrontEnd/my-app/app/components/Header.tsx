// app/components/Header.tsx
"use client";

import Link from "next/link";
import { Container, Nav, Navbar } from "react-bootstrap";
import styles from "../styles/header.module.css";

export default function Header() {
    return (
        <Navbar expand="lg" className={styles.navbar} sticky="top">
            <Container>
                <Navbar.Brand as={Link} href="/" className={styles.logo}>
                    BidViet
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="main-nav" />
                <Navbar.Collapse id="main-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} href="/">Trang chủ</Nav.Link>
                        <Nav.Link as={Link} href="/auction">Đấu giá</Nav.Link>
                        <Nav.Link as={Link} href="/categories">Danh mục</Nav.Link>
                        <Nav.Link as={Link} href="/results">Kết quả</Nav.Link>
                        <Nav.Link as={Link} href="/news">Tin tức</Nav.Link>
                        <Nav.Link as={Link} href="/admin">Admin</Nav.Link>
                    </Nav>

                    <Nav>
                        <Nav.Link as={Link} href="/login">Đăng nhập</Nav.Link>
                        <Nav.Link as={Link} href="/register" className={styles.registerBtn}>
                            Đăng ký
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
