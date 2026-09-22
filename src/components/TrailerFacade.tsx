import { useState } from "react";

interface TrailerFacadeProps {
  videoKey?: string;
  posterUrl: string;
}

function TrailerFacade({ videoKey, posterUrl }: TrailerFacadeProps) {
  const [playing, setPlaying] = useState(false);

  if (playing && videoKey) {
    return (
      <iframe
        src={import.meta.env.VITE_YOUTUBE_URL + videoKey}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="relative w-full h-full group"
      aria-label="Play trailer"
    >
      <img
        src={posterUrl}
        alt="movie poster"
        className="w-full h-full object-cover rounded-md brightness-75 group-hover:brightness-90 transition-all"
      />
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <span className="w-16 h-16 rounded-full bg-white/15 border border-white/50 backdrop-blur-sm flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
            <path d="M6 4v16l14-8z" />
          </svg>
        </span>
        <span className="text-sm tracking-wide text-slate-200">
          Click to play trailer
        </span>
      </span>
    </button>
  );
}

export default TrailerFacade;
