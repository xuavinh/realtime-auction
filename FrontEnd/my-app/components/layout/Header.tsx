"use client";

import Link from "next/link";
import {
    startTransition,
    useEffect,
    useState,
} from "react";

import {
    Container,
    Nav,
    Navbar,
    NavDropdown,
} from "react-bootstrap";

import { Dropdown } from "antd";
import type { MenuProps } from "antd";

import { AUTH_STORAGE_KEYS } from "@/features/auth/constants/storage";
import {
    clearAuthSession,
    syncAuthCookie,
} from "@/features/auth/utils/session";

import styles from "./Header.module.css";

const items: MenuProps["items"] = [
    {
        key: "1",
        label: (
            <Link href="/categories/dien-tu">Điện tử</Link>
        ),
    },
    {
        key: "2",
        label: (
            <Link href="/categories/thoi-trang">Thời trang</Link>
        ),
    },
    {
        key: "3",
        label: (
            <Link href="/categories/xe-co">Xe cộ</Link>
        ),
    },
    {
        key: "4",
        label: (
            <Link href="/categories/bat-dong-san">Bất động sản</Link>
        ),
    },
    {
        key: "5",
        label: (
            <Link href="/categories/nghe-thuat">Nghệ thuật</Link>
        ),
    },
    {
        key: "6",
        label: (
            <Link href="/categories/do-co">Đồ cổ</Link>
        ),
    },

];

export default function Header() {

    const [isLogin, setIsLogin] = useState(false);

    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {

        const token =
            localStorage.getItem(
                AUTH_STORAGE_KEYS.accessToken
            );

        const email =
            localStorage.getItem(
                AUTH_STORAGE_KEYS.userEmail
            );

        if (token) {
            syncAuthCookie(token);

            startTransition(() => {
                setIsLogin(true);
                setUserEmail(email ?? "");
            });
        }

    }, []);

    const handleLogout = () => {
        clearAuthSession();

        setIsLogin(false);

        window.location.href = "/";
    };

    return (
        <Navbar
            expand="lg"
            className={styles.navbar}
            sticky="top"
        >

            <Container>

                {/* <Navbar.Brand as={Link} href="/" className={styles.logo}>
                    BidViet
                </Navbar.Brand> */}
                <Navbar.Brand as={Link} href="/">
                    <img
                        src="/logo.png"
                        alt="BidViet Logo"
                        className={styles.logo}
                    />
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="main-nav" />

                <Navbar.Collapse id="main-nav">

                    <Nav className="me-auto">

                        <Nav.Link as={Link} href="/">Trang chủ</Nav.Link>
                        <Nav.Link as={Link} href="/auction">Đấu giá</Nav.Link>

                        <Dropdown menu={{ items }} trigger={["click"]}>
                            <a
                                onClick={(e) => e.preventDefault()}
                                className={styles.dropdownLink}
                            >
                                Danh mục
                            </a>

                        </Dropdown>

                        <Nav.Link as={Link} href="/watchlist">Theo dõi</Nav.Link>
                        <Nav.Link as={Link} href="/new-auction">Tạo đấu giá</Nav.Link>

                    </Nav>
                    <Nav>

                        {
                            isLogin ? (

                                <NavDropdown
                                    title={userEmail}
                                    id="user-dropdown"
                                >

                                    <NavDropdown.Item
                                        as={Link}
                                        href="/users/me"
                                    >
                                        Hồ sơ
                                    </NavDropdown.Item>
                                    <NavDropdown.Item
                                        as={Link}
                                        href="/users/myauction"
                                    >
                                        Đấu giá của tôi
                                    </NavDropdown.Item>

                                    <NavDropdown.Divider />

                                    <NavDropdown.Item
                                        onClick={handleLogout}
                                    >
                                        Đăng xuất
                                    </NavDropdown.Item>

                                </NavDropdown>

                            ) : (

                                <>
                                    <Nav.Link
                                        as={Link}
                                        href="/auth/login"
                                    >
                                        Đăng nhập
                                    </Nav.Link>

                                    <Nav.Link
                                        as={Link}
                                        href="/auth/register"
                                        className={styles.registerBtn}
                                    >
                                        Đăng ký
                                    </Nav.Link>
                                </>

                            )
                        }

                    </Nav>

                </Navbar.Collapse>

            </Container>

        </Navbar>
    );
}
