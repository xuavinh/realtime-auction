"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
    Container,
    Nav,
    Navbar,
    NavDropdown,
} from "react-bootstrap";

import { Dropdown } from "antd";
import type { MenuProps } from "antd";

import styles from "../styles/header.module.css";

const items: MenuProps["items"] = [
    {
        key: "1",
        label: (
            <Link href="/categories/electronics">Điện tử</Link>
        ),
    },
    {
        key: "2",
        label: (
            <Link href="/categories/fashion">Thời trang</Link>
        ),
    },
    {
        key: "3",
        label: (
            <Link href="/categories/vehicle">Xe cộ</Link>
        ),
    },
    {
        key: "4",
        label: (
            <Link href="/categories/real-estate">Bất động sản</Link>
        ),
    },
    {
        key: "5",
        label: (
            <Link href="/categories/art">Nghệ thuật</Link>
        ),
    },
    {
        key: "6",
        label: (
            <Link href="/categories/antiques">Đồ cổ</Link>
        ),
    }

];

export default function Header() {

    const [isLogin, setIsLogin] = useState(false);

    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {

        const token =
            localStorage.getItem(
                "access_token"
            );

        const email =
            localStorage.getItem(
                "user_email"
            );

        if (token) {

            setIsLogin(true);

            if (email) {
                setUserEmail(email);
            }
        }

    }, []);

    const handleLogout = () => {

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "user_uuid"
        );

        localStorage.removeItem(
            "user_email"
        );

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

                <Navbar.Brand as={Link} href="/" className={styles.logo}>
                    BidViet
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

                        <Nav.Link as={Link} href="/results">Kết quả</Nav.Link>
                        <Nav.Link as={Link} href="/news">Tin tức</Nav.Link>

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
                                        href="/profile"
                                    >
                                        Hồ sơ
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
                                        href="/login"
                                    >
                                        Đăng nhập
                                    </Nav.Link>

                                    <Nav.Link
                                        as={Link}
                                        href="/register"
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