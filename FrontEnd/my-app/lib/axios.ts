import axios from "axios";

import { AUTH_STORAGE_KEYS } from "@/features/auth/constants/storage";

const api = axios.create({
    baseURL:
        process.env.NEXT_PUBLIC_API_URL,

    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {

        if (
            typeof window !==
            "undefined"
        ) {

            const token =
                localStorage.getItem(
                    AUTH_STORAGE_KEYS.accessToken
                );

            if (token) {
                config.headers.set(
                    "Authorization",
                    `Bearer ${token}`
                );
            }
        }

        return config;
    }
);

export default api;