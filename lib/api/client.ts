import axios from "axios";
import { error } from "console";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.details ||
            error.response?.data?.message ||
            error.message ||
            "Something went wrong!";

        return Promise.reject(new Error(message));
    }
);