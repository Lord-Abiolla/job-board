import { apiClient } from "./client";

export async function register(data: {
    name: string;
    email: string;
    password: string;
}) {
    const res = await apiClient.post("/auth/register/", data);
    return res.data;
}

export async function login(email: string, password: string) {
    const res = await apiClient.post("/auth/login/", { email, password });

    // store token
    const { access, refresh } = res.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    return res.data;
}

export async function getCurrentUser() {
    const res = await apiClient.get("/auth/me/");
    return res.data;
}

export function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}
