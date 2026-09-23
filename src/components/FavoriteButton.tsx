import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "@/reducer/favoritesSlice";
import { FavoriteMovie } from "@/utils/module";

interface FavoritesSelectorType {
  favorites: {
    items: FavoriteMovie[];
  };
}

interface FavoriteButtonProps {
  movie: FavoriteMovie;
  className?: string;
  variant?: "icon" | "pill";
}

function FavoriteButton({
  movie,
  className = "",
  variant = "icon",
}: FavoriteButtonProps) {
  const dispatch = useDispatch();
  const isFavorite = useSelector((state: FavoritesSelectorType) =>
    state.favorites.items.some((item) => item.id === movie.id)
  );

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleFavorite(movie));
  }

  const heartIcon = (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill={isFavorite ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.5 4A5.4 5.4 0 0 1 12 7a5.4 5.4 0 0 1 6.5-3c3.5.5 5 4 3.5 7.7C19.5 16.4 12 21 12 21z" />
    </svg>
  );

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isFavorite}
        className={`flex items-center gap-2 py-2.5 px-5 rounded-md border transition-colors ${
          isFavorite
            ? "bg-primary border-primary text-white"
            : "bg-transparent border-white/25 text-white hover:border-white/50"
        } ${className}`}
      >
        {heartIcon}
        {isFavorite ? "已收藏" : "加入收藏"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isFavorite ? "移除收藏" : "加入收藏"}
      aria-pressed={isFavorite}
      className={`flex items-center justify-center rounded-full transition-colors ${
        isFavorite ? "bg-primary text-white" : "bg-black/55 text-white"
      } ${className}`}
    >
      {heartIcon}
    </button>
  );
}

export default FavoriteButton;
