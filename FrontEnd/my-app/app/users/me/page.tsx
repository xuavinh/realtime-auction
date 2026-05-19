'use client';

import React, { useState } from 'react';
import {
    Avatar,
    Button,
    Card,
    Col,
    Form,
    Input,
    message,
    Row,
    Space,
    Typography,
    Upload,
} from 'antd';
import type { GetProp, UploadProps } from 'antd';
import {
    CameraOutlined,
    LoadingOutlined,
    LockOutlined,
    PlusOutlined,
    SaveOutlined,
    UserOutlined,
} from '@ant-design/icons';

import styles from './profile.module.css';

const { Title, Text } = Typography;

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
};

const ProfilePage = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>();

    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();

    const beforeUpload = (file: FileType) => {
        const isJpgOrPng =
            file.type === 'image/jpeg' || file.type === 'image/png';

        if (!isJpgOrPng) {
            messageApi.error('Chỉ hỗ trợ file JPG/PNG');
        }

        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isLt2M) {
            messageApi.error('Ảnh phải nhỏ hơn 2MB');
        }

        return isJpgOrPng && isLt2M;
    };

    const handleChange: UploadProps['onChange'] = (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }

        if (info.file.status === 'done') {
            getBase64(info.file.originFileObj as FileType, (url) => {
                setLoading(false);
                setImageUrl(url);
                messageApi.success('Upload avatar thành công');
            });
        }
    };

    const handleUpdateProfile = (values: any) => {
        console.log(values);
        messageApi.success('Cập nhật thông tin thành công');
    };

    const handleChangePassword = (values: any) => {
        console.log(values);
        messageApi.success('Đổi mật khẩu thành công');
        passwordForm.resetFields();
    };

    const uploadButton = (
        <div className={styles.uploadButton}>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div className={styles.uploadText}>Upload</div>
        </div>
    );

    return (
        <>
            {contextHolder}

            <div className={styles.container}>
                <Row gutter={[24, 24]}>
                    {/* LEFT */}
                    <Col xs={24} lg={8}>
                        <Card className={styles.profileCard}>
                            <div className={styles.avatarWrapper}>
                                <Upload
                                    name="avatar"
                                    listType="picture-circle"
                                    showUploadList={false}
                                    className={styles.avatarUploader}
                                    action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                                    beforeUpload={beforeUpload}
                                    onChange={handleChange}
                                >
                                    {imageUrl ? (
                                        <div className={styles.avatarContainer}>
                                            <img
                                                src={imageUrl}
                                                alt="avatar"
                                                className={styles.avatarImage}
                                                draggable={false}
                                            />

                                            <div className={styles.overlay}>
                                                <CameraOutlined />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.emptyAvatar}>
                                            {loading ? (
                                                <LoadingOutlined className={styles.uploadIcon} />
                                            ) : (
                                                <>
                                                    <Avatar
                                                        size={90}
                                                        icon={<UserOutlined />}
                                                        className={styles.mainAvatar}
                                                    />

                                                    <div className={styles.changePhoto}>
                                                        <CameraOutlined />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </Upload>
                                <div className={styles.userInfo}>
                                    <h3 className={styles.userName}>Nguyễn Văn A</h3>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* RIGHT */}
                    <Col xs={24} lg={16}>
                        <Space orientation="vertical" size={24} style={{ width: '100%' }}>
                            {/* PROFILE */}
                            <Card
                                className={styles.card}
                                title={
                                    <Space>
                                        <UserOutlined />
                                        Thông tin cá nhân
                                    </Space>
                                }
                            >
                                <Form
                                    form={profileForm}
                                    layout="vertical"
                                    onFinish={handleUpdateProfile}
                                    initialValues={{
                                        fullName: 'Nguyễn Văn A',
                                        email: 'nguyenvana@gmail.com',
                                    }}
                                >
                                    <Row gutter={16}>
                                        <Col xs={24}>
                                            <Form.Item
                                                label="Full Name"
                                                name="fullName"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Vui lòng nhập full name',
                                                    },
                                                ]}
                                            >
                                                <Input
                                                    size="large"
                                                    placeholder="Nhập full name"
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24}>
                                            <Form.Item label="Email" name="email">
                                                <Input size="large" disabled />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<SaveOutlined />}
                                        size="large"
                                        className={styles.saveBtn}
                                    >
                                        Lưu thay đổi
                                    </Button>
                                </Form>
                            </Card>

                            {/* PASSWORD */}
                            <Card
                                className={styles.card}
                                title={
                                    <Space>
                                        <LockOutlined />
                                        Đổi mật khẩu
                                    </Space>
                                }
                            >
                                <Form
                                    form={passwordForm}
                                    layout="vertical"
                                    onFinish={handleChangePassword}
                                >
                                    <Form.Item
                                        label="Mật khẩu hiện tại"
                                        name="currentPassword"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập mật khẩu hiện tại',
                                            },
                                        ]}
                                    >
                                        <Input.Password
                                            size="large"
                                            placeholder="Nhập mật khẩu hiện tại"
                                        />
                                    </Form.Item>

                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Mật khẩu mới"
                                                name="newPassword"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Vui lòng nhập mật khẩu mới',
                                                    },
                                                    {
                                                        min: 6,
                                                        message: 'Mật khẩu tối thiểu 6 ký tự',
                                                    },
                                                ]}
                                            >
                                                <Input.Password
                                                    size="large"
                                                    placeholder="Nhập mật khẩu mới"
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Xác nhận mật khẩu"
                                                name="confirmPassword"
                                                dependencies={['newPassword']}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Vui lòng xác nhận mật khẩu',
                                                    },
                                                    ({ getFieldValue }) => ({
                                                        validator(_, value) {
                                                            if (
                                                                !value ||
                                                                getFieldValue('newPassword') === value
                                                            ) {
                                                                return Promise.resolve();
                                                            }

                                                            return Promise.reject(
                                                                new Error('Mật khẩu xác nhận không khớp'),
                                                            );
                                                        },
                                                    }),
                                                ]}
                                            >
                                                <Input.Password
                                                    size="large"
                                                    placeholder="Nhập lại mật khẩu"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Button
                                        type="primary"
                                        danger
                                        htmlType="submit"
                                        size="large"
                                    >
                                        Đổi mật khẩu
                                    </Button>
                                </Form>
                            </Card>
                        </Space>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default ProfilePage;