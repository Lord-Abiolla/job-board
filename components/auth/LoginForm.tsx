"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();
    const params = useSearchParams();
    const next = params.get("next") || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const { login, loading } = useAuth();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        try {
            await login(email, password);
            router.push(next);
        } catch (error: any) {
            setError(error.message || "Login failed");
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-emerald-100"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl cursor-pointer bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
                {loading ? "Signing in" : "Sign in"}
            </button>

            <p className="text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="font-medium text-emerald-700 hover:text-emerald-800">
                    Create one
                </Link>
            </p>
        </form>
    );
}
