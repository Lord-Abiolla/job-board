"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RoleGate({
    allow,
    children,
}: {
    allow: Array<"EMPLOYER" | "CANDIDATE" | "ADMIN">;
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!user) router.push("/auth/login");
        else if (!allow.includes(user.role)) router.push("/");
    }, [user, loading, allow, router]);

    if (loading || !user || !allow.includes(user.role)) return null;
    return <>{children}</>;
}
