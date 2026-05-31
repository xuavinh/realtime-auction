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


export default function Header() {

    const [isLogin, setIsLogin] = useState(false);

    const [userEmail, setUserEmail] = useState("");
    const [expanded, setExpanded] = useState(false);

    const categoryItems: MenuProps["items"] = [
        {
            key: "1",
            label: (
                <Link href="/categories/dien-tu" onClick={() => setExpanded(false)}>Điện tử</Link>
            ),
        },
        {
            key: "2",
            label: (
                <Link href="/categories/thoi-trang" onClick={() => setExpanded(false)}>Thời trang</Link>
            ),
        },
        {
            key: "3",
            label: (
                <Link href="/categories/xe-co" onClick={() => setExpanded(false)}>Xe cộ</Link>
            ),
        },
        {
            key: "4",
            label: (
                <Link href="/categories/bat-dong-san" onClick={() => setExpanded(false)}>Bất động sản</Link>
            ),
        },
        {
            key: "5",
            label: (
                <Link href="/categories/nghe-thuat" onClick={() => setExpanded(false)}>Nghệ thuật</Link>
            ),
        },
        {
            key: "6",
            label: (
                <Link href="/categories/do-co" onClick={() => setExpanded(false)}>Đồ cổ</Link>
            ),
        },
    ];

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
        setExpanded(false);

        window.location.href = "/";
    };

    return (
        <Navbar
            expand="lg"
            className={styles.navbar}
            sticky="top"
            expanded={expanded}
            onToggle={setExpanded}
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

                        <Nav.Link as={Link} href="/" onClick={() => setExpanded(false)}>Trang chủ</Nav.Link>
                        <Nav.Link as={Link} href="/auction" onClick={() => setExpanded(false)}>Đấu giá</Nav.Link>

                        <Dropdown menu={{ items: categoryItems }} trigger={["click"]}>
                            <a
                                onClick={(e) => e.preventDefault()}
                                className={styles.dropdownLink}
                            >
                                Danh mục
                            </a>

                        </Dropdown>

                        <Nav.Link as={Link} href="/watchlist" onClick={() => setExpanded(false)}>Theo dõi</Nav.Link>
                        <Nav.Link as={Link} href="/new-auction" onClick={() => setExpanded(false)}>Tạo đấu giá</Nav.Link>

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
                                        onClick={() => setExpanded(false)}
                                    >
                                        Hồ sơ
                                    </NavDropdown.Item>
                                    <NavDropdown.Item
                                        as={Link}
                                        href="/users/myauction"
                                        onClick={() => setExpanded(false)}
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
                                        onClick={() => setExpanded(false)}
                                    >
                                        Đăng nhập
                                    </Nav.Link>

                                    <Nav.Link
                                        as={Link}
                                        href="/auth/register"
                                        className={styles.registerBtn}
                                        onClick={() => setExpanded(false)}
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
