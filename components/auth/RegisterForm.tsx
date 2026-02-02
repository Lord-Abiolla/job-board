"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types/user";
import { useAuth } from "@/context/AuthContext";

export default function RegisterForm() {
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState<UserRole>("CANDIDATE");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState<string | null>(null);

    const { register, loading } = useAuth();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (password !== password2) {
            setError("Passwords do not match!")
            return;
        }

        try {
            await register({
                email,
                password,
                password2,
                first_name: firstName,
                last_name: lastName,
                role,
            });
            router.push("/")

        } catch (err: any) {
            console.log("STATUS:", err?.response?.status);
            console.log("DATA:", err?.response?.data);

            const data = err?.response?.data;
            if (data && typeof data === "object") {
                const msg = Object.entries(data)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
                    .join("\n");
                setError(msg);
            } else {
                setError(err.message || "Registration failed");
            }
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">First Name</label>
                    <input
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Last name</label>
                    <input
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="cursor-pointer w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                >
                    <option value="CANDIDATE">Candidate</option>
                    <option value="EMPLOYER">Employer</option>
                </select>
                <p className="text-xs text-slate-500">
                    This decides what you can do in the dashboard.
                </p>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Confirm password</label>
                    <input
                        type="password"
                        required
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-700 px-4 py-3 cursor-pointer text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
                {loading ? "Creating account..." : "Create account"}
            </button>

            <p className="text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link className="font-medium text-emerald-700 hover:text-emerald-800" href="/auth/login">
                    Sign in
                </Link>
            </p>
        </form >
    );
}