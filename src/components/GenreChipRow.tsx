import { useNavigate } from "react-router-dom";
import { RouthPath } from "@/routers/router";
import { CURATED_GENRES } from "@/constants/genres";

function GenreChipRow() {
  const navigate = useNavigate();

  function handleChipClick(anchor: string) {
    navigate(`${RouthPath.home}#${anchor}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-6 no-scrollbar">
      <button
        type="button"
        className="flex-none py-2 px-4 rounded-full text-sm font-bold bg-white text-black"
      >
        All
      </button>
      {CURATED_GENRES.map((genre) => (
        <button
          key={genre.id}
          type="button"
          onClick={() => handleChipClick(genre.anchor)}
          className="flex-none py-2 px-4 rounded-full text-sm font-bold border border-white/20 bg-white/5 text-slate-300 hover:bg-white/10"
        >
          {genre.label}
        </button>
      ))}
    </div>
  );
}

export default GenreChipRow;
