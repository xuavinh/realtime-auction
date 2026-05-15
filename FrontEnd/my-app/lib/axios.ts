import axios from "axios";

import { AUTH_STORAGE_KEYS } from "@/features/auth/constants/storage";

const api = axios.create({
    baseURL: "http://localhost:8080/api/v1",
});

api.interceptors.request.use(
    (config) => {

        if (typeof window !== "undefined") {

            const token =
                localStorage.getItem(
                    AUTH_STORAGE_KEYS.accessToken
                );

            if (token) {
                config.headers.Authorization =
                    `Bearer ${token}`;
            }
        }

        return config;
    }
);

export default api;
