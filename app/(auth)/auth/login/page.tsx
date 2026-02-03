export const dynamic = "force-dynamic";

import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="flex justify-center items-center">
            <AuthShell
                title="Welcome back"
                subtitle="Sign in to apply for jobs or manage job postings."
            >
                <LoginForm />
            </AuthShell>
        </div>
    )
}