"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RoleGate({
    allow,
    children,
}: {
    allow: Array<"CANDIDATE" | "EMPLOYER">;
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push("/auth/login");
        if (!loading && user && !allow.includes(user.role)) router.push("/");
    }, [user, loading, allow, router]);

    if (loading) return null;
    if (!user) return null;
    if (!allow.includes(user.role)) return null;

    return <>{children}</>;
}
