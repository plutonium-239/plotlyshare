export const onRequest: PagesFunction = async () => {
    return new Response(
        null,
        {
            status: 302,
            headers: {
                location: "/",
                "Set-Cookie": `__Session-worker.auth.providers-token=; Secure; HttpOnly; SameSite=Lax; Expires=${new Date().toUTCString()}; path=/; `,
            },
        }
    )
}