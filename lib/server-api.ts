export async function serverFetch<T = unknown>(path: string): Promise<T> {
    const res = await fetch(
        `${process.env.API_BASE_URL}${path}`,
        { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed");
    return res.json();
}
