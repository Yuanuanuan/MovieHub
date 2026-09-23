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
