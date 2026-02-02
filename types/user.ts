export type UserRole = "CANDIDATE" | "EMPLOYER" | "ADMIN";

export type User = {
    id: number | string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    is_employer?: boolean;
    is_candidate?: boolean;
};
