"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FormGroup from "react-bootstrap/FormGroup";
import FormLabel from "react-bootstrap/FormLabel";
import FormControl from "react-bootstrap/FormControl";
import FormCheck from "react-bootstrap/FormCheck";
import Alert from "react-bootstrap/Alert";

import styles from "../../styles/login.module.css";

import { register } from "@/services/auth.service";

function Register() {

    const router = useRouter();

    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword,
        setConfirmPassword] =
        useState("");

    const [agree, setAgree] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        setError("");

        if (password !== confirmPassword) {

            setError(
                "Mật khẩu xác nhận không khớp"
            );

            return;
        }

        if (!agree) {

            setError(
                "Bạn cần đồng ý điều khoản"
            );

            return;
        }

        try {

            setLoading(true);

            await register({
                name,
                email,
                password,
            });
            alert("Đăng ký thành công");

            router.push("/auth/login");

        } catch (err: any) {

            const details =
                err.response?.data?.details;

            if (details?.length > 0) {

                setError(
                    details[0].message
                );

            } else {

                setError(
                    err.response?.data?.message ||
                    "Đăng ký thất bại"
                );
            }

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.formBox}>

                <h2 className={styles.title}>
                    Đăng ký
                </h2>

                <Form onSubmit={handleSubmit}>

                    {
                        error && (
                            <Alert variant="danger">
                                {error}
                            </Alert>
                        )
                    }

                    <FormGroup className="mb-3">

                        <FormLabel>
                            Họ tên
                        </FormLabel>

                        <FormControl
                            type="text"
                            placeholder="Nhập họ tên"
                            value={name}
                            onChange={(e) =>
                                setName(
                                    e.target.value
                                )
                            }
                        />

                    </FormGroup>

                    <FormGroup className="mb-3">

                        <FormLabel>
                            Email
                        </FormLabel>

                        <FormControl
                            type="email"
                            placeholder="Nhập email"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                        />

                    </FormGroup>

                    <FormGroup className="mb-3">

                        <FormLabel>
                            Mật khẩu
                        </FormLabel>

                        <FormControl
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                        />

                    </FormGroup>

                    <FormGroup className="mb-3">

                        <FormLabel>
                            Nhập lại mật khẩu
                        </FormLabel>

                        <FormControl
                            type="password"
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(
                                    e.target.value
                                )
                            }
                        />

                    </FormGroup>

                    <FormGroup className="mb-3">

                        <FormCheck
                            label="Tôi đồng ý với điều khoản"
                            checked={agree}
                            onChange={(e) =>
                                setAgree(
                                    e.target.checked
                                )
                            }
                        />

                    </FormGroup>

                    <Button
                        className={styles.button}
                        variant="primary"
                        type="submit"
                        disabled={loading}
                    >

                        {
                            loading
                                ? "Đang đăng ký..."
                                : "Đăng ký"
                        }

                    </Button>

                </Form>

            </div>
        </div>
    );
}

export default Register;