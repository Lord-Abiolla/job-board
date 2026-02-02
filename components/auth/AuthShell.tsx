import Link from "next/link";

export default function AuthShell({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top, rgba(16,185,129,0.18), transparent_60%)]" />

            <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10">
                <div className="w-full max-w-md">
                    <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-700 text-white font-semibold">
                            JB
                        </span>
                        <span className="font-semibold">JobBoard</span>
                    </Link>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <h1 className="text-center text-2xl font-semibold text-slate-900">{title}</h1>
                        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
                        <div className="mt-6">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}