"use client";

import type { User, UserRole } from "@/types/user";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    login as apiLogin,
    register as apiRegister,
    logout as apiLogout,
    getCurrentUser,
} from "@/lib/api/auth";

type RegisterPayload = {
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
    role: UserRole;
};

type AuthContextValue = {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function hasToken() {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("access_token"));
}

function mergeUser(prev: User | null, next: User): User {
    return {
        ...prev,
        ...next,
        first_name: next.first_name ?? prev?.first_name ?? "",
        last_name: next.last_name ?? prev?.last_name ?? "",
    } as User;
}


function readStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("auth_user");
    if (!raw) return null;
    try {
        return JSON.parse(raw) as User;
    } catch {
        return null;
    }
}

function storeUser(user: User) {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_user", JSON.stringify(user));
}

function clearStoredUser() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_user");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [hydrated, setHydrated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHydrated(true);

        const stored = readStoredUser();
        if (stored) setUser(stored);
    }, []);

    const isAuthenticated = hydrated && !!user;

    useEffect(() => {
        let mounted = true;

        (async () => {
            setLoading(true);
            try {
                if (!hasToken()) {
                    if (mounted) setUser(null);
                    clearStoredUser();
                    return;
                }

                const me = (await getCurrentUser()) as User;

                if (mounted) {
                    const merged = mergeUser(readStoredUser(), me);
                    setUser(merged);
                    storeUser(merged);

                }
            } catch (err) {
                apiLogout();
                clearStoredUser();
                if (mounted) setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    async function refreshUser() {
        setLoading(true);

        try {
            if (!hasToken()) {
                setUser(null);
                clearStoredUser();
                return;
            }

            const me = (await getCurrentUser()) as User;
            const merged = mergeUser(readStoredUser(), me);
            setUser(merged);
            storeUser(merged);

        } catch (err) {
            apiLogout();
            clearStoredUser();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(email: string, password: string) {
        setLoading(true);
        try {
            const data = await apiLogin(email, password);
            const me = data.user as User;
            setUser(me);
            storeUser(me);
        } finally {
            setLoading(false);
        }
    }

    async function register(payload: RegisterPayload) {
        setLoading(true);
        try {
            await apiRegister(payload);
            await login(payload.email, payload.password);
        } finally {
            setLoading(false);
        }
    }

    function logout() {
        apiLogout();
        clearStoredUser();
        setUser(null);
    }

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated,
            loading,
            login,
            register,
            logout,
            refreshUser,
        }),
        [user, isAuthenticated, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
