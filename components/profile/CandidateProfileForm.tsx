"use client";

import { useMemo, useState } from "react";
import type { CandidateProfile, CandidateProfileFlat } from "@/types/profile";

export type CandidateProfileFormPayload = {
    first_name?: string;
    last_name?: string;
    phone?: string;
    gender?: string;
    date_of_birth?: string;
    headline?: string;
    about?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    profile_picture?: File | null;
    resume?: File | null;
};

function splitName(full: string) {
    const s = (full ?? "").trim();
    if (!s) return { first: "", last: "" };
    const parts = s.split(/\s+/);
    return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}

function getSocial(initial: CandidateProfile | CandidateProfileFlat) {
    // nested candidate (has top-level website/linkedin/...)
    if ("user" in initial) {
        return {
            website: initial.website ?? "",
            linkedin: initial.linkedin ?? "",
            github: initial.github ?? "",
            twitter: initial.twitter ?? "",
        };
    }

    // flat candidate (uses social_links)
    const s = initial.social_links ?? {};
    return {
        website: s.website ?? "",
        linkedin: s.linkedin ?? "",
        github: s.github ?? "",
        twitter: s.twitter ?? "",
    };
}



export default function CandidateProfileForm({
    initial,
    onSubmit,
}: {
    initial: CandidateProfile | CandidateProfileFlat;
    onSubmit: (payload: CandidateProfileFormPayload) => Promise<void>;
}) {
    const initialName = useMemo(() => {
        const user = (initial as any)?.user;

        // nested candidate shape
        if (user) {
            return {
                f: String(user.first_name ?? ""),
                l: String(user.last_name ?? ""),
                email: String(user.email ?? ""),
            };
        }

        // flat candidate shape
        const full = String((initial as any)?.name ?? "");
        const { first, last } = splitName(full);

        return {
            f: first,
            l: last,
            email: String((initial as any)?.email ?? ""),
        };
    }, [initial]);


    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const [firstName, setFirstName] = useState(() => initialName.f);
    const [lastName, setLastName] = useState(() => initialName.l);

    const [phone, setPhone] = useState(initial.phone ?? "");
    const [gender, setGender] = useState(initial.gender ?? "");
    const [dateOfBirth, setDateOfBirth] = useState(initial.date_of_birth ?? "");
    const [headline, setHeadline] = useState(initial.headline ?? "");
    const [about, setAbout] = useState(initial.about ?? "");

    const social = useMemo(() => getSocial(initial), [initial]);

    const [website, setWebsite] = useState(() => social.website);
    const [linkedin, setLinkedin] = useState(() => social.linkedin);
    const [github, setGithub] = useState(() => social.github);
    const [twitter, setTwitter] = useState(() => social.twitter);



    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [resume, setResume] = useState<File | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setMsg(null);
        setSaving(true);
        try {
            await onSubmit({
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                phone: phone.trim(),
                gender: gender.trim(),
                date_of_birth: dateOfBirth.trim(),
                headline: headline.trim(),
                about,
                website: website.trim(),
                linkedin: linkedin.trim(),
                github: github.trim(),
                twitter: twitter.trim(),
                profile_picture: profilePic,
                resume,
            });
        } catch (err: any) {
            const data = err?.response?.data;
            const text =
                data?.detail ||
                (typeof data === "object" ? JSON.stringify(data) : null) ||
                err?.message ||
                "Failed to update profile";
            setMsg(text);
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-xl font-semibold text-slate-900">Edit Candidate Profile</h1>
            <p className="mt-1 text-sm text-slate-600">Update your details and upload files.</p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="First name" value={firstName} onChange={setFirstName} />
                <Field label="Last name" value={lastName} onChange={setLastName} />

                <Field label="Phone" value={phone} onChange={setPhone} placeholder="+123..." />
                <div>
                    <label className="text-sm font-medium text-slate-700">Gender</label>
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    >
                        <option value="">—</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                    </select>
                </div>


                <Field label="Date of birth" value={dateOfBirth} onChange={setDateOfBirth} type="date" />
                <Field label="Headline" value={headline} onChange={setHeadline} placeholder="Senior Software Engineer" />

                <Field label="Website" value={website} onChange={setWebsite} placeholder="https://example.com" />
                <Field label="LinkedIn" value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/in/..." />

                <Field label="GitHub" value={github} onChange={setGithub} placeholder="https://github.com/..." />
                <Field label="Twitter" value={twitter} onChange={setTwitter} placeholder="https://twitter.com/..." />
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
                <FileField label="Profile picture" accept="image/*" onFile={setProfilePic} />
                <FileField label="Resume (PDF)" accept="application/pdf" onFile={setResume} />
            </div>

            {msg && (
                <div className="mt-5 whitespace-pre-line rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
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
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div>
            <label className="text-sm font-medium text-slate-700">{label}</label>
            <input
                value={value}
                type={type}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
        </div>
    );
}

function FileField({
    label,
    accept,
    onFile,
}: {
    label: string;
    accept?: string;
    onFile: (f: File | null) => void;
}) {
    return (
        <div>
            <label className="text-sm font-medium text-slate-700">{label}</label>
            <input
                type="file"
                accept={accept}
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">Upload a file if you want to replace the existing one.</p>
        </div>
    );
}