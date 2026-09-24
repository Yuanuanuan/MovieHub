// Vercel Function: proxies TMDB API requests so the Bearer token never
// reaches the browser. vercel.json rewrites /api/tmdb/:path* here, passing
// the captured path as a `path` query param (fixed filename — the bracket
// catch-all route `api/tmdb/[...path].ts` was detected in the Functions tab
// but never actually routed, returning a platform 404 for every request).
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
  const path = url.searchParams.get("path") ?? "";
  url.searchParams.delete("path");
  const query = url.searchParams.toString();

  const tmdbRes = await fetch(`${baseUrl}/${path}${query ? `?${query}` : ""}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Read the body ourselves rather than returning tmdbRes directly — fetch()
  // transparently decompresses the upstream gzip body, but a pass-through
  // Response would forward TMDB's original content-encoding/content-length
  // headers alongside the already-decompressed body, so browsers see a
  // mismatch and fail the request even though curl (no Accept-Encoding by
  // default) doesn't hit it.
  const data = await tmdbRes.json();
  return Response.json(data, { status: tmdbRes.status });
}
