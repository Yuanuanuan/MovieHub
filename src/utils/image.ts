import { MovieInfo } from "@/utils/module";

const IMAGE_BASE_URL: string = import.meta.env.VITE_IMAGE_URL;

/** 依用途決定 TMDB 圖片尺寸並組出完整網址；沒有路徑時回傳 null */
function buildImageUrl(path: string | null, size: string): string | null {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

/** 海報網址（w500） */
export function getPosterUrl(path: string | null): string | null {
  return buildImageUrl(path, "w500");
}

/** 背景大圖網址（w1280） */
export function getBackdropUrl(path: string | null): string | null {
  return buildImageUrl(path, "w1280");
}

/** 演員大頭照網址（w185） */
export function getProfileUrl(path: string | null): string | null {
  return buildImageUrl(path, "w185");
}

/** 這筆電影資料有沒有海報，供清單過濾使用 */
export function hasPoster(movie: Pick<MovieInfo, "poster_path">): boolean {
  return !!movie.poster_path;
}
