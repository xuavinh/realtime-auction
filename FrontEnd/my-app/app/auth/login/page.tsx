"use client";

import { useState } from "react";
import type { AxiosError } from "axios";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FormGroup from "react-bootstrap/FormGroup";
import FormLabel from "react-bootstrap/FormLabel";
import FormControl from "react-bootstrap/FormControl";
import FormCheck from "react-bootstrap/FormCheck";
import Alert from "react-bootstrap/Alert";

import { login } from "@/features/auth/services/auth.service";
import { persistAuthSession } from "@/features/auth/utils/session";
import styles from "@/features/auth/styles/AuthForm.module.css";

type LoginErrorResponse = {
    details?: Array<{
        message: string;
    }>;
    message?: string;
};

function Login() {
    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [remember, setRemember] =
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

        try {

            setLoading(true);

            const res = await login({
                email,
                password,
            });

            console.log(res);

            persistAuthSession({
                accessToken: res.data.access_token,
                userUuid: res.data.user_uuid,
                userEmail: email,
                remember,
                expiresIn: res.data.expires_in,
            });

            // alert("Đăng nhập thành công");

            window.location.href = "/";

        } catch (err) {

            const error =
                err as AxiosError<LoginErrorResponse>;

            console.log(
                error.response?.data
            );

            const details =
                error.response?.data?.details;

            const firstDetail =
                details?.[0];

            if (firstDetail) {

                setError(
                    firstDetail.message
                );

            } else {

                setError(
                    error.response?.data?.message ||
                    "Đăng nhập thất bại"
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
                    Đăng nhập
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

                        <FormCheck
                            type="checkbox"
                            label="Ghi nhớ đăng nhập"
                            checked={remember}
                            onChange={(e) =>
                                setRemember(
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
                                ? "Đang đăng nhập..."
                                : "Đăng nhập"
                        }

                    </Button>

                    <div className={styles.registerLink}>

                        Chưa có tài khoản?{" "}
                        <a href="/auth/register">
                            Đăng ký ngay
                        </a>
                    </div>
                </Form>

            </div>

        </div>
    );
}

export default Login;
