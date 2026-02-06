"use client";

import { useState } from "react";
import type { EmployerProfile } from "@/types/profile";

export type EmployerProfileFormPayload = {
    name?: string;
    company_name?: string;
    industry?: string;
    city?: string;
    country?: string;
    description?: string;
    website_url?: string;
    linkedin_url?: string;
    company_logo_url?: File | null;
};

export default function EmployerProfileForm({
    initial,
    onSubmit,
}: {
    initial: EmployerProfile;
    onSubmit: (payload: EmployerProfileFormPayload) => Promise<void>;
}) {
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const [name, setName] = useState(initial.name ?? "");
    const [companyName, setCompanyName] = useState(initial.company_name ?? "");
    const [industry, setIndustry] = useState(initial.industry ?? "");
    const [city, setCity] = useState(initial.city ?? "");
    const [country, setCountry] = useState(initial.country ?? "");
    const [websiteUrl, setWebsiteUrl] = useState(initial.website_url ?? "");
    const [linkedinUrl, setLinkedinUrl] = useState(initial.linkedin_url ?? "");
    const [description, setDescription] = useState(initial.description ?? "");

    const [logoFile, setLogoFile] = useState<File | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setMsg(null);
        setSaving(true);
        try {
            await onSubmit({
                name: name.trim(),
                company_name: companyName.trim(),
                industry: industry.trim(),
                city: city.trim(),
                country: country.trim(),
                website_url: websiteUrl.trim(),
                linkedin_url: linkedinUrl.trim(),
                description,
                company_logo_url: logoFile,
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
            <h1 className="text-xl font-semibold text-slate-900">Edit Employer Profile</h1>
            <p className="mt-1 text-sm text-slate-600">Update your company details.</p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Name" value={name} onChange={setName} placeholder="Jane Doe" />
                <Field label="Company name" value={companyName} onChange={setCompanyName} placeholder="Acme Inc." />

                <Field label="Industry" value={industry} onChange={setIndustry} placeholder="Software" />
                <Field label="City" value={city} onChange={setCity} placeholder="London" />

                <Field label="Country" value={country} onChange={setCountry} placeholder="UK" />
                <Field label="Website" value={websiteUrl} onChange={setWebsiteUrl} placeholder="https://company.com" />

                <Field
                    label="LinkedIn"
                    value={linkedinUrl}
                    onChange={setLinkedinUrl}
                    placeholder="https://linkedin.com/company/..."
                />
            </div>

            <div className="mt-4">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    placeholder="Tell candidates about your company..."
                />
            </div>

            <div className="mt-6">
                <FileField label="Company logo" accept="image/*" onFile={setLogoFile} />
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
