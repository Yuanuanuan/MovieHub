export interface CuratedGenre {
  id: number;
  label: string;
  anchor: string;
}

export const CURATED_GENRES: CuratedGenre[] = [
  { id: 28, label: "動作", anchor: "row-action" },
  { id: 35, label: "喜劇", anchor: "row-comedy" },
  { id: 27, label: "恐怖", anchor: "row-new" },
  { id: 878, label: "科幻", anchor: "row-new" },
  { id: 18, label: "劇情", anchor: "row-new" },
  { id: 16, label: "動畫", anchor: "row-new" },
  { id: 10749, label: "愛情", anchor: "row-new" },
  { id: 99, label: "紀錄片", anchor: "row-new" },
];

/** TMDB's zh-TW genre translations are sometimes simplified Chinese;
 * override with correct Traditional Chinese labels wherever a genre name
 * is rendered directly from the API. */
export const GENRE_NAME_OVERRIDES: Record<number, string> = {
  28: "動作",
  12: "冒險",
  16: "動畫",
  35: "喜劇",
  80: "犯罪",
  99: "紀錄片",
  18: "劇情",
  10751: "家庭",
  14: "奇幻",
  36: "歷史",
  27: "恐怖",
  10402: "音樂",
  9648: "懸疑",
  10749: "愛情",
  878: "科幻",
  10770: "電視電影",
  53: "驚悚",
  10752: "戰爭",
  37: "西部",
};

export function getGenreName(genre: { id: number; name: string }) {
  return GENRE_NAME_OVERRIDES[genre.id] ?? genre.name;
}
