import { apiClient } from "./client";
import { UserRole } from "@/types/user";

export async function register(data: {
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
    role: UserRole;
}) {
    const payload = {
        email: data.email,
        password: data.password,
        confirm_password: data.password2,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
    };

    const res = await apiClient.post("/auth/register/", payload);
    return res.data;
}

export async function login(email: string, password: string) {
    const res = await apiClient.post("/auth/login/", { email, password });

    // { user, access, refresh }
    const { access, refresh } = res.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    return res.data;
}

export async function refreshToken() {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) throw new Error("No refresh token");

    const res = await apiClient.post("/auth/refresh/", { refresh });
    const { access } = res.data;
    localStorage.setItem("access_token", access)
    return access;
}

export async function getCurrentUser() {
    const res = await apiClient.get("/auth/me/");
    return res.data;
}

export function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}
