"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ProfileMenu() {
    const { user, logout, loading } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    const displayName = useMemo(() => {
        const first = user?.first_name?.trim();
        if (first) return first;
        const email = user?.email?.trim();
        if (email) return email.split("@")[0];
        return "User";
    }, [user]);

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        }
        function onEsc(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    // While auth is loading, show a subtle placeholder button (prevents layout jump)
    if (loading) {
        return (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm text-white/80">
                <span className="hidden sm:inline">...</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">👤</span>
            </div>
        );
    }

    if (!user) {
        return (
            <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                aria-label="Login"
            >
                <span className="hidden sm:inline font-medium">Login</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">👤</span>
            </Link>
        );
    }

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                aria-label="Profile menu"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <span className="hidden sm:inline">
                    <span className="font-semibold">{displayName}</span>
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">👤</span>
                <span className="hidden sm:inline text-white/70">▾</span>
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-emerald-950/95 shadow-lg shadow-emerald-950/20 backdrop-blur"
                >
                    <div className="px-4 py-3">
                        <p className="text-sm font-semibold text-white">{displayName}</p>
                        <p className="mt-0.5 truncate text-xs text-emerald-100/70">{user.email}</p>
                    </div>

                    <div className="h-px bg-white/10" />

                    <MenuLink href="/profile" label="Profile" onClick={() => setOpen(false)} />
                    <MenuLink
                        href="/applications"
                        label="Applications"
                        onClick={() => setOpen(false)}
                    />

                    <div className="h-px bg-white/10" />

                    <button
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            logout();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/90 hover:bg-white/10 focus:outline-none"
                    >
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}

function MenuLink({
    href,
    label,
    onClick,
}: {
    href: string;
    label: string;
    onClick: () => void;
}) {
    return (
        <Link
            role="menuitem"
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/90 hover:bg-white/10 focus:outline-none"
        >
            <span className="font-medium">{label}</span>
        </Link>
    );
}
