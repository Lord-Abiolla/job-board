import axios from "axios";
import { refreshToken, logout } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Refresh on 401 (single retry)
let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original?._retry) {
            original._retry = true;

            try {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        queue.push((token) => {
                            try {
                                original.headers = original.headers ?? {};
                                original.headers.Authorization = `Bearer ${token}`;
                                resolve(apiClient(original));
                            } catch (e) {
                                reject(e);
                            }
                        });
                    });
                }

                isRefreshing = true;
                const newAccess = await refreshToken();
                isRefreshing = false;

                queue.forEach((cb) => cb(newAccess));
                queue = [];

                original.headers = original.headers ?? {};
                original.headers.Authorization = `Bearer ${newAccess}`;
                return apiClient(original);
            } catch (e) {
                isRefreshing = false;
                queue = [];
                logout();
                return Promise.reject(e);
            }
        }

        const data = error?.response?.data;
        error.message =
            data?.detail ||
            data?.message ||
            (typeof data === "object" ? JSON.stringify(data) : error.message) ||
            "Request failed";

        return Promise.reject(error);
    }
);