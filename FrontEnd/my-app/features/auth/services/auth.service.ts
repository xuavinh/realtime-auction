import api from "@/lib/axios";

export type LoginRequest = {
    email: string;
    password: string;
};

export type RegisterRequest = {
    name: string;
    email: string;
    password: string;
};

export type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    data: {
        user_uuid: string;
        access_token: string;
        expires_in: number;
    };
};

// login
export async function login(
    data: LoginRequest
): Promise<AuthResponse> {

    const res = await api.post(
        "/auth/login",
        data
    );

    return res.data;
}

// register
export async function register(
    data: RegisterRequest
) {

    const res = await api.post(
        "/auth/register",
        {
            full_name: data.name,
            email: data.email,
            password: data.password,
        }
    );

    return res.data;
}

// logout
export async function logout() {

    const res = await api.post(
        "/auth/logout"
    );

    return res.data;
}

// profile
export async function getProfile() {

    const res = await api.get(
        "/users/me"
    );

    return res.data;
}