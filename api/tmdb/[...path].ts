// Vercel Function (Web standard Request/Response signature): proxies TMDB
// API requests so the Bearer token never reaches the browser. Frontend calls
// /api/tmdb/* with no auth header; this handler attaches Authorization
// server-side before forwarding to TMDB.
export async function GET(request: Request) {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) {
    return Response.json(
      { error: { message: "TMDB_API_TOKEN is not configured" } },
      { status: 500 }
    );
  }

  const baseUrl = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/tmdb\//, "");

  return fetch(`${baseUrl}/${path}${url.search}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}
