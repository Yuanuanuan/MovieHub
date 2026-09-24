import type { VercelRequest, VercelResponse } from "@vercel/node";

// Vercel Serverless Function: proxies TMDB API requests so the Bearer token
// never reaches the browser. Frontend calls /api/tmdb/* with no auth header;
// this handler attaches Authorization server-side before forwarding to TMDB.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: { message: "Method not allowed" } });
    return;
  }

  const token = process.env.TMDB_API_TOKEN;
  const baseUrl = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";

  if (!token) {
    res
      .status(500)
      .json({ error: { message: "TMDB_API_TOKEN is not configured" } });
    return;
  }

  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments.join("/") : segments ?? "";

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (key === "path") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined) {
      params.append(key, value as string);
    }
  }
  const query = params.toString();

  const tmdbRes = await fetch(`${baseUrl}/${path}${query ? `?${query}` : ""}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await tmdbRes.json();
  res.status(tmdbRes.status).json(data);
}
