export async function serverFetch(path: string) {
    const res = await fetch(
        `${process.env.API_BASE_URL}${path}`,
        { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed");
    return res.json();
}
