import { useNavigate, useSearchParams } from "react-router-dom";
import { RouthPath } from "@/routers/router";
import { CURATED_GENRES } from "@/constants/genres";

function GenreChipRow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeGenreId = searchParams.get("genre");

  function handleChipClick(genreId?: number) {
    if (genreId) {
      navigate(`${RouthPath.home}?genre=${genreId}`);
    } else {
      navigate(RouthPath.home);
    }
  }

  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-6 no-scrollbar">
      <button
        type="button"
        onClick={() => handleChipClick()}
        className={`flex-none py-2 px-4 rounded-full text-sm font-bold transition-colors ${
          !activeGenreId
            ? "bg-white text-black"
            : "border border-white/20 bg-white/5 text-slate-300 hover:bg-white/10"
        }`}
      >
        全部
      </button>
      {CURATED_GENRES.map((genre) => (
        <button
          key={genre.id}
          type="button"
          onClick={() => handleChipClick(genre.id)}
          className={`flex-none py-2 px-4 rounded-full text-sm font-bold transition-colors ${
            Number(activeGenreId) === genre.id
              ? "bg-white text-black"
              : "border border-white/20 bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          {genre.label}
        </button>
      ))}
    </div>
  );
}

export default GenreChipRow;
