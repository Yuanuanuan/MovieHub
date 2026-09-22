import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "@/reducer";
import favoritesReducer, {
  FAVORITES_STORAGE_KEY,
} from "@/reducer/favoritesSlice";

export const store = configureStore({
  reducer: {
    main: mainReducer,
    favorites: favoritesReducer,
  },
});

store.subscribe(() => {
  localStorage.setItem(
    FAVORITES_STORAGE_KEY,
    JSON.stringify(store.getState().favorites.items)
  );
});

export default store;
