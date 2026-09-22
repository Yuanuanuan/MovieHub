import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FavoriteMovie } from "@/utils/module";

const STORAGE_KEY = "moviehub_favorites_v1";

export interface FavoritesState {
  items: FavoriteMovie[];
}

function loadInitialState(): FavoritesState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { items: JSON.parse(raw) as FavoriteMovie[] };
  } catch {
    // corrupt or inaccessible localStorage — fall back to empty
  }
  return { items: [] };
}

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: loadInitialState(),
  reducers: {
    toggleFavorite(state, action: PayloadAction<FavoriteMovie>) {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(action.payload);
      }
    },
  },
});

export const { toggleFavorite } = favoritesSlice.actions;
export const FAVORITES_STORAGE_KEY = STORAGE_KEY;
export default favoritesSlice.reducer;
