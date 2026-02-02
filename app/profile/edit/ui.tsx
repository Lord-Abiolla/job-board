"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserProfile } from "@/types/profile";
import { getMyProfile, updateMyProfile } from "@/lib/api/profile";

export default function EditProfileClient() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    // form fields
    const [phone, setPhone] = useState("");
    const [headline, setHeadline] = useState("");
    const [about, setAbout] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [github, setGithub] = useState("");
    const [twitter, setTwitter] = useState("");
    const [website, setWebsite] = useState("");

    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [resume, setResume] = useState<File | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        let mounted = true;

        (async () => {
            setLoading(true);
            try {
                const data = await getMyProfile();
                if (!mounted) return;
                setProfile(data);

                setPhone(data.phone ?? "");
                setHeadline(data.headline ?? "");
                setAbout(data.about ?? "");
                setLinkedin(data.linkedin ?? "");
                setGithub(data.github ?? "");
                setTwitter(data.twitter ?? "");
                setWebsite(data.website ?? "");
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [isAuthenticated, authLoading, router]);

    const name = useMemo(() => {
        const f = profile?.user?.first_name?.trim();
        const l = profile?.user?.last_name?.trim();
        return [f, l].filter(Boolean).join(" ") || profile?.user?.email || "";
    }, [profile]);

    async function onSave(e: React.FormEvent) {
        e.preventDefault();
        setMsg(null);
        setSaving(true);

        try {
            const form = new FormData();

            if (phone.trim()) form.append("phone", phone.trim());
            if (headline.trim()) form.append("headline", headline.trim());
            if (about.trim()) form.append("about", about.trim());
            if (linkedin.trim()) form.append("linkedin", linkedin.trim());
            if (github.trim()) form.append("github", github.trim());
            if (twitter.trim()) form.append("twitter", twitter.trim());
            if (website.trim()) form.append("website", website.trim());

            if (profilePic) form.append("profile_picture", profilePic);
            if (resume) form.append("resume", resume);

            const updated = await updateMyProfile(form);
            setProfile(updated);
            setMsg("Profile updated successfully ✅");
            router.push("/profile");
        } catch (err: any) {
            const data = err?.response?.data;
            const text =
                data?.detail ||
                (typeof data === "object" ? JSON.stringify(data) : null) ||
                err.message ||
                "Failed to update profile";
            setMsg(text);
        } finally {
            setSaving(false);
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
                <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-600">Loading edit form...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/profile" className="text-sm font-medium text-emerald-800 hover:underline">
                        ← Back to profile
                    </Link>
                    <div className="text-sm text-slate-600">Editing: <span className="font-semibold text-slate-900">{name}</span></div>
                </div>

                <form onSubmit={onSave} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <h1 className="text-xl font-semibold text-slate-900">Edit Profile</h1>
                    <p className="mt-1 text-sm text-slate-600">Update your details and upload files (multipart/form-data).</p>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Phone" value={phone} onChange={setPhone} placeholder="+123..." />
                        <Field label="Headline" value={headline} onChange={setHeadline} placeholder="Senior Software Engineer" />
                        <Field label="LinkedIn" value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/in/..." />
                        <Field label="GitHub" value={github} onChange={setGithub} placeholder="https://github.com/..." />
                        <Field label="Twitter" value={twitter} onChange={setTwitter} placeholder="https://twitter.com/..." />
                        <Field label="Website" value={website} onChange={setWebsite} placeholder="https://example.com" />
                    </div>

                    <div className="mt-4">
                        <label className="text-sm font-medium text-slate-700">About</label>
                        <textarea
                            value={about}
                            onChange={(e) => setAbout(e.target.value)}
                            rows={6}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            placeholder="Tell employers about yourself..."
                        />
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FileField label="Profile picture" onFile={setProfilePic} />
                        <FileField label="Resume (PDF)" onFile={setResume} />
                    </div>

                    {msg && (
                        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 whitespace-pre-line">
                            {msg}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="mt-6 w-full rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <div>
            <label className="text-sm font-medium text-slate-700">{label}</label>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
        </div>
    );
}

function FileField({ label, onFile }: { label: string; onFile: (f: File | null) => void }) {
    return (
        <div>
            <label className="text-sm font-medium text-slate-700">{label}</label>
            <input
                type="file"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">Upload a file if you want to replace the existing one.</p>
        </div>
    );
}
