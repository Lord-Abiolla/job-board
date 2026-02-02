export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";
export type JobType = "REMOTE" | "ONSITE" | "HYBRID";
export type ExperienceLevel = "ENTRY" | "INTERMEDIATE" | "SENIOR" | "LEAD" | "EXECUTIVE";
export type JobStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "EXPIRED";
export type EmployerInfo = {
    id: number;
    company_name: string;
    logo?: string | null;
    industry?: string | null;
    company_size?: string | null;
    website_url?: string | null;
    is_verified?: boolean;
};

export type PostedBy = {
    id: number;
    company_name: string;
};

export type Category = {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
};

export type Job = {
    id: number | string;
    title: string;
    description: string;
    employer?: EmployerInfo;
    posted_by?: PostedBy;

    responsibilities?: string[];
    requirements?: string[];
    nice_to_have?: string[];
    benefits?: string[];

    employment_type: EmploymentType;
    job_type: JobType;
    experience_level?: ExperienceLevel;

    salary_min?: number | null;
    salary_max?: number | null;
    currency?: string | null;
    is_salary_disclosed?: boolean;

    location?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;

    categories?: Category[];

    application_deadline?: string | null;
    status?: JobStatus;

    createdAt?: string;
};

export type JobUpsertPayload = {
    title: string;
    description: string;

    responsibilities?: string[];
    requirements?: string[];
    nice_to_have?: string[];
    benefits?: string[];

    employment_type: EmploymentType;
    job_type: JobType;
    experience_level?: ExperienceLevel;

    salary_min?: number | null;
    salary_max?: number | null;
    currency?: string | null;
    is_salary_disclosed?: boolean;

    location?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;

    application_deadline?: string | null;
    status?: JobStatus;
};
