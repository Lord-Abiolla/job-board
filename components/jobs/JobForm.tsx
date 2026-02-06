"use client";

import { useMemo, useState } from "react";
import type {
    Job,
    JobStatus,
    EmploymentType,
    ExperienceLevel,
    JobType,
    JobUpsertPayload,
} from "@/types/job";

type Props = {
    initial?: Job | null;
    mode: "create" | "edit";
    onSubmit: (payload: JobUpsertPayload) => Promise<void>;
    onDelete?: () => Promise<void>;
};

function linesToArray(v: string) {
    return v
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
}

function arrayToLines(arr?: string[]) {
    return (arr ?? []).join("\n");
}

export default function JobForm({ initial, mode, onSubmit, onDelete }: Props) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const defaults = useMemo(() => {
        return {
            title: initial?.title ?? "",
            description: initial?.description ?? "",

            responsibilities: arrayToLines(initial?.responsibilities),
            requirements: arrayToLines(initial?.requirements),
            nice_to_have: arrayToLines(initial?.nice_to_have),
            benefits: arrayToLines(initial?.benefits),

            employment_type: (initial?.employment_type ?? "FULL_TIME") as EmploymentType,
            job_type: (initial?.job_type ?? "REMOTE") as JobType,
            experience_level: (initial?.experience_level ?? "ENTRY") as ExperienceLevel,

            salary_min: initial?.salary_min ?? "",
            salary_max: initial?.salary_max ?? "",
            currency: initial?.currency ?? "KES",
            is_salary_disclosed: initial?.is_salary_disclosed ?? false,

            location: initial?.location ?? "",
            city: initial?.city ?? "",
            state: initial?.state ?? "",
            country: initial?.country ?? "",

            application_deadline: initial?.application_deadline ?? "",
            status: (initial?.status ?? "DRAFT") as JobStatus,
        };
    }, [initial]);

    const [form, setForm] = useState(defaults);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            const payload: JobUpsertPayload = {
                title: form.title,
                description: form.description,

                responsibilities: linesToArray(form.responsibilities),
                requirements: linesToArray(form.requirements),
                nice_to_have: linesToArray(form.nice_to_have),
                benefits: linesToArray(form.benefits),

                employment_type: form.employment_type,
                job_type: form.job_type,
                experience_level: form.experience_level,

                salary_min: form.salary_min === "" ? null : Number(form.salary_min),
                salary_max: form.salary_max === "" ? null : Number(form.salary_max),
                currency: form.currency || null,
                is_salary_disclosed: form.is_salary_disclosed,

                location: form.location || null,
                city: form.city || null,
                state: form.state || null,
                country: form.country || null,

                application_deadline: form.application_deadline || null,
                status: form.status,
            };

            if (!payload.title.trim()) throw new Error("Title is required.");
            if (!payload.description.trim()) throw new Error("Description is required.");

            await onSubmit(payload);
        } catch (err: any) {
            setError(err?.message || "Failed to save job");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">
                        {mode === "create" ? "Create Job" : "Edit Job"}
                    </h1>
                    <p className="text-sm text-slate-600">
                        Fill the details below. Lists can be entered one item per line.
                    </p>
                </div>

                {mode === "edit" && onDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                        Delete
                    </button>
                )}
            </div>

            {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-line">
                    {error}
                </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-5">
                <Field label="Job Title">
                    <input
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        placeholder="Senior Backend Developer"
                    />
                </Field>

                <Field label="Description">
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        rows={5}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        placeholder="Describe the role, team, and expectations..."
                    />
                </Field>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <SelectField
                        label="Employment Type"
                        value={form.employment_type}
                        onChange={(v) => setForm((p) => ({ ...p, employment_type: v as EmploymentType }))}
                        options={[
                            ["FULL_TIME", "Full-time"],
                            ["PART_TIME", "Part-time"],
                            ["CONTRACT", "Contract"],
                            ["INTERNSHIP", "Internship"],
                            ["FREELANCE", "Freelance"],
                        ]}
                    />
                    <SelectField
                        label="Job Type"
                        value={form.job_type}
                        onChange={(v) => setForm((p) => ({ ...p, job_type: v as JobType }))}
                        options={[
                            ["REMOTE", "Remote"],
                            ["ON_SITE", "On-site"],
                            ["HYBRID", "Hybrid"],
                        ]}
                    />
                    <SelectField
                        label="Experience Level"
                        value={form.experience_level}
                        onChange={(v) => setForm((p) => ({ ...p, experience_level: v as ExperienceLevel }))}
                        options={[
                            ["ENTRY", "Entry"],
                            ["INTERMEDIATE", "Intermediate"],
                            ["SENIOR", "Senior"],
                            ["LEAD", "Lead"],
                            ["EXECUTIVE", "Executive"],
                        ]}
                    />
                    <SelectField
                        label="Status"
                        value={form.status}
                        onChange={(v) => setForm((p) => ({ ...p, status: v as JobStatus }))}
                        options={[
                            ["DRAFT", "Draft"],
                            ["ACTIVE", "Active"],
                            ["CLOSED", "Closed"],
                            ["EXPIRED", "Expired"],
                        ]}
                    />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field label="Responsibilities (one per line)">
                        <textarea
                            value={form.responsibilities}
                            onChange={(e) => setForm((p) => ({ ...p, responsibilities: e.target.value }))}
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            placeholder={"Design scalable backend services\nMentor junior devs\nCollaborate with product"}
                        />
                    </Field>

                    <Field label="Requirements (one per line)">
                        <textarea
                            value={form.requirements}
                            onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))}
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            placeholder={"5+ years experience\nStrong REST APIs\nSQL knowledge"}
                        />
                    </Field>

                    <Field label="Nice to have (one per line)">
                        <textarea
                            value={form.nice_to_have}
                            onChange={(e) => setForm((p) => ({ ...p, nice_to_have: e.target.value }))}
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            placeholder={"Docker/Kubernetes\nAWS experience\nFrontend skills"}
                        />
                    </Field>

                    <Field label="Benefits (one per line)">
                        <textarea
                            value={form.benefits}
                            onChange={(e) => setForm((p) => ({ ...p, benefits: e.target.value }))}
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            placeholder={"Health insurance\nRemote options\nProfessional development budget"}
                        />
                    </Field>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold text-slate-900">Compensation</h3>
                    <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
                        <Field label="Salary Min">
                            <input
                                inputMode="numeric"
                                value={form.salary_min}
                                onChange={(e) => setForm((p) => ({ ...p, salary_min: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
                                placeholder="100000"
                            />
                        </Field>
                        <Field label="Salary Max">
                            <input
                                inputMode="numeric"
                                value={form.salary_max}
                                onChange={(e) => setForm((p) => ({ ...p, salary_max: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
                                placeholder="150000"
                            />
                        </Field>
                        <Field label="Currency">
                            <input
                                value={form.currency}
                                onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
                                placeholder="KES"
                            />
                        </Field>
                    </div>

                    <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={form.is_salary_disclosed}
                            onChange={(e) => setForm((p) => ({ ...p, is_salary_disclosed: e.target.checked }))}
                            className="h-4 w-4 rounded border-slate-300"
                        />
                        Show salary on listing
                    </label>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field label="Location (free text)">
                        <input
                            value={form.location}
                            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
                            placeholder="Mombasa, KE"
                        />
                    </Field>
                    <Field label="Application Deadline (YYYY-MM-DD)">
                        <input
                            type="date"
                            value={form.application_deadline}
                            onChange={(e) => setForm((p) => ({ ...p, application_deadline: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
                        />
                    </Field>
                    <Field label="City">
                        <input
                            value={form.city}
                            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
                        />
                    </Field>
                    <Field label="State">
                        <input
                            value={form.state}
                            onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
                        />
                    </Field>
                    <Field label="Country">
                        <input
                            value={form.country}
                            onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
                            placeholder="Kenya"
                        />
                    </Field>
                </div>

                <div className="mt-2 flex justify-end gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60"
                    >
                        {saving ? "Saving..." : mode === "create" ? "Create Job" : "Save Changes"}
                    </button>
                </div>
            </div>
        </form>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="space-y-2">
            <div className="text-sm font-medium text-slate-700">{label}</div>
            {children}
        </label>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: [string, string][];
}) {
    return (
        <label className="space-y-2">
            <div className="text-sm font-medium text-slate-700">{label}</div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            >
                {options.map(([val, text]) => (
                    <option key={val} value={val}>
                        {text}
                    </option>
                ))}
            </select>
        </label>
    );
}
