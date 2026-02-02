import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="flex justify-center items-center">
            <AuthShell
                title="Create your account"
                subtitle="Join as a candidate or employee and get started."
            >
                <RegisterForm />
            </AuthShell>
        </div>
    )
}