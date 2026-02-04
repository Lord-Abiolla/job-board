export type ApplicationStatus = "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED" | string;

export type ApplicationJob = {
    id: number;
    title: string;
    company: string;
};

export type ApplicationCandidate = {
    id: number;
    user?: {
        email: string;
        first_name: string;
        last_name: string;
    };
    headline?: string | null;
    profile_picture?: string | null;
};

export type Application = {
    id: number;
    job: ApplicationJob;

    candidate?: ApplicationCandidate;

    cover_letter: string;
    resume: string | null;

    expected_salary: number | null;
    available_from: string | null;

    status: ApplicationStatus;
    is_withdrawn: boolean;

    applied_at: string | null;
    reviewed_at: string | null;
    created_at: string;
};
