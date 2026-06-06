import axios from "axios";

import { AUTH_STORAGE_KEYS } from "@/features/auth/constants/storage";
import { syncAuthCookie, clearAuthSession } from "@/features/auth/utils/session";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
            if (token) {
                config.headers.set("Authorization", `Bearer ${token}`);
            }
        }
        return config;
    }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/login") &&
            !originalRequest.url?.includes("/auth/refresh") &&
            !originalRequest.url?.includes("/auth/register")
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.set("Authorization", `Bearer ${token}`);
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Gọi API refresh token
                const response = await api.post("/auth/refresh");
                const data = response.data.data;
                const newAccessToken = data.access_token;
                const expiresIn = data.expires_in;
                const userUuid = data.user_uuid;

                // Cập nhật thông tin token mới vào localStorage
                localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, newAccessToken);
                if (userUuid) {
                    localStorage.setItem(AUTH_STORAGE_KEYS.userUuid, userUuid);
                }

                // Đồng bộ cookie access token
                syncAuthCookie(newAccessToken, expiresIn);

                // Cập nhật token cho request hiện tại và thực thi lại
                originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
                
                processQueue(null, newAccessToken);
                isRefreshing = false;
                
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                // Xóa session client và redirect về login khi refresh thất bại
                clearAuthSession();
                if (typeof window !== "undefined") {
                    window.location.href = "/auth/login";
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;