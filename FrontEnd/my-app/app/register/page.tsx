"use client";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FormGroup from "react-bootstrap/FormGroup";
import FormLabel from "react-bootstrap/FormLabel";
import FormControl from "react-bootstrap/FormControl";
import FormCheck from "react-bootstrap/FormCheck";

import styles from "../styles/login.module.css";

function Register() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.formBox}>
                <h2 className={styles.title}>Đăng ký</h2>

                <Form>
                    <FormGroup className="mb-3">
                        <FormLabel>Họ tên</FormLabel>
                        <FormControl type="text" placeholder="Nhập họ tên" />
                    </FormGroup>

                    <FormGroup className="mb-3">
                        <FormLabel>Email</FormLabel>
                        <FormControl type="email" placeholder="Nhập email" />
                    </FormGroup>

                    <FormGroup className="mb-3">
                        <FormLabel>Mật khẩu</FormLabel>
                        <FormControl type="password" placeholder="Nhập mật khẩu" />
                    </FormGroup>

                    <FormGroup className="mb-3">
                        <FormLabel>Nhập lại mật khẩu</FormLabel>
                        <FormControl type="password" placeholder="Nhập lại mật khẩu" />
                    </FormGroup>

                    <FormGroup className="mb-3">
                        <FormCheck label="Tôi đồng ý với điều khoản" />
                    </FormGroup>

                    <Button className={styles.button} variant="primary" type="submit">
                        Đăng ký
                    </Button>
                </Form>
            </div>
        </div>
    );
}

export default Register;