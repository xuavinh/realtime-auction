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

import { login } from "@/services/auth.service";

function Login() {

    const router = useRouter();

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

            localStorage.setItem(
                "access_token",
                res.data.access_token
            );

            localStorage.setItem(
                "user_uuid",
                res.data.user_uuid
            );

            localStorage.setItem(
                "user_email",
                email
            );
            if (remember) {

                localStorage.setItem(
                    "remember_login",
                    "true"
                );
            }

            alert("Đăng nhập thành công");

            window.location.href = "/";

        } catch (err: any) {

            console.log(
                err.response?.data
            );

            const details =
                err.response?.data?.details;

            if (details?.length > 0) {

                setError(
                    details[0].message
                );

            } else {

                setError(
                    err.response?.data?.message ||
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

                </Form>

            </div>

        </div>
    );
}

export default Login;