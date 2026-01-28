export type Role = "employee" | "employer";

export type Company = {
    id: number | string;
    name: string;
    logoUrl: string | null;
};

export type Job = {
    id: number | string;
    title: string;
    description: string;
    status: string;
    location?: string;
    jobType?: "remote" | "onsite" | "hybrid" | string;
    employmentType?: "full_time" | "part_time" | "contract" | "internship" | string;
    createdAt?: string;
    company?: Company | null;
}