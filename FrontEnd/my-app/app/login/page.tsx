"use client";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import FormControl from 'react-bootstrap/FormControl';
import FormCheck from 'react-bootstrap/FormCheck';

import styles from "../styles/login.module.css";

function Login() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.formBox}>
                <h2 className={styles.title}>Đăng nhập</h2>

                <Form>
                    <FormGroup className="mb-3">
                        <FormLabel>Email</FormLabel>
                        <FormControl type="email" placeholder="Nhập email" />
                    </FormGroup>

                    <FormGroup className="mb-3">
                        <FormLabel>Mật khẩu</FormLabel>
                        <FormControl type="password" placeholder="Nhập mật khẩu" />
                    </FormGroup>

                    <FormGroup className="mb-3">
                        <FormCheck type="checkbox" label="Ghi nhớ đăng nhập" />
                    </FormGroup>

                    <Button className={styles.button} variant="primary" type="submit">
                        Đăng nhập
                    </Button>
                </Form>
            </div>
        </div>
    );
}

export default Login;