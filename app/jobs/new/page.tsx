import RoleGate from "@/context/RoleGate";
import JobCreateClient from "./ui";

export default function NewJobPage() {
    return (
        <RoleGate allow={["EMPLOYER"]}>
            <JobCreateClient />
        </RoleGate>
    );
}
