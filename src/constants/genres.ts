export interface CuratedGenre {
  id: number;
  label: string;
  anchor: string;
}

export const CURATED_GENRES: CuratedGenre[] = [
  { id: 28, label: "Action", anchor: "row-action" },
  { id: 35, label: "Comedy", anchor: "row-comedy" },
  { id: 27, label: "Horror", anchor: "row-new" },
  { id: 878, label: "Sci-Fi", anchor: "row-new" },
  { id: 18, label: "Drama", anchor: "row-new" },
  { id: 16, label: "Animation", anchor: "row-new" },
  { id: 10749, label: "Romance", anchor: "row-new" },
  { id: 99, label: "Documentary", anchor: "row-new" },
];
