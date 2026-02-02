import RoleGate from "@/context/RoleGate";
import JobEditClient from "./ui";

export default function EditJobPage() {
    return (
        <RoleGate allow={["EMPLOYER"]}>
            <JobEditClient />
        </RoleGate>
    );
}
