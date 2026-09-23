import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import starIcon from "/star.svg";
import { getPopularMovieList, getMovieDetails } from "@/api/movie";
import FavoriteButton from "@/components/FavoriteButton";
import { RouthPath } from "@/routers/router";
import { IMovieDetails, MovieInfo } from "@/utils/module";
import { getGenreName } from "@/constants/genres";

const GRAIN_BACKGROUND_IMAGE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/></svg>\")";

function Hero() {
  const [candidates, setCandidates] = useState<MovieInfo[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeDetails, setActiveDetails] = useState<IMovieDetails | null>(
    null
  );
  const [playing, setPlaying] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    getPopularMovieList(1).then((results: MovieInfo[]) => {
      setCandidates(results.filter((m) => m.backdrop_path).slice(0, 5));
    });
  }, []);

  useEffect(() => {
    const current = candidates[activeIndex];
    if (!current) return;
    let cancelled = false;
    getMovieDetails(current.id, false).then((res) => {
      if (!cancelled) setActiveDetails(res.data as IMovieDetails);
    });
    return () => {
      cancelled = true;
    };
  }, [candidates, activeIndex]);

  useEffect(() => {
    setPlaying(false);
  }, [activeIndex]);

  useEffect(() => {
    if (candidates.length <= 1) return;
    if (playing || hovering || focused) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const intervalId = setInterval(() => {
      setActiveIndex((i) => (i + 1) % candidates.length);
    }, 5500);

    return () => clearInterval(intervalId);
  }, [candidates.length, playing, hovering, focused, activeIndex]);

  if (!activeDetails) return null;

  const backdropUrl =
    import.meta.env.VITE_IMAGE_URL + activeDetails.backdrop_path;
  const hours = Math.floor(activeDetails.runtime / 60) || 0;
  const mins = activeDetails.runtime % 60 || 0;
  const trailerKey = activeDetails.videos.results[0]?.key;

  return (
    <section
      className="relative w-full h-[70vh] max-h-[560px] overflow-hidden rounded-2xl mb-10"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setFocused(false);
        }
      }}
    >
      <div className="absolute inset-0">
        {playing && trailerKey ? (
          <iframe
            src={`${import.meta.env.VITE_YOUTUBE_URL}${trailerKey}?autoplay=1&rel=0`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div key={activeDetails.id} className="absolute inset-0 animate-hero-fade">
            <img
              src={backdropUrl}
              alt={activeDetails.title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 opacity-50 mix-blend-overlay pointer-events-none"
              style={{ backgroundImage: GRAIN_BACKGROUND_IMAGE }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
          </div>
        )}
      </div>

      {playing && trailerKey && (
        <button
          type="button"
          onClick={() => setPlaying(false)}
          aria-label="關閉預告片"
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7l-1.4-1.4L9.2 12 2.9 5.7l1.4-1.4L10.6 10.6l6.3-6.3z" />
          </svg>
        </button>
      )}

      {!playing && (
        <div
          key={activeDetails.id}
          className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10 max-w-2xl gap-3 text-white animate-hero-content-in"
        >
          <p className="uppercase tracking-widest text-sm text-slate-300 font-bebas">
            本週精選
          </p>
          <h1 className="text-3xl md:text-5xl font-bold">
            {activeDetails.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span className="flex items-center gap-1 font-bold">
              <img src={starIcon} width={16} height={16} alt="星星圖示" />
              {activeDetails.vote_average.toFixed(1)}
            </span>
            <span>{activeDetails.release_date?.slice(0, 4)}</span>
            <span>·</span>
            <span>
              {hours}小時{mins}分
            </span>
            <div className="flex flex-wrap gap-2">
              {activeDetails.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="text-xs px-3 py-1 rounded-full border border-white/25"
                >
                  {getGenreName(genre)}
                </span>
              ))}
            </div>
          </div>
          <p className="text-slate-300 text-sm md:text-base line-clamp-2 max-w-xl">
            {activeDetails.overview}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {trailerKey && (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="flex items-center gap-2 py-2.5 px-6 rounded-md bg-white text-black font-bold hover:bg-slate-200"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path d="M6 4v16l14-8z" />
                </svg>
                播放預告
              </button>
            )}
            <Link
              to={`${RouthPath.details}/${activeDetails.id}`}
              className="py-2.5 px-6 rounded-md bg-white/10 border border-white/30 backdrop-blur-sm"
            >
              詳細資訊
            </Link>
            <FavoriteButton
              movie={{
                id: activeDetails.id,
                title: activeDetails.title,
                poster_path: activeDetails.poster_path,
                vote_average: activeDetails.vote_average,
              }}
              className="w-11 h-11"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {candidates.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`精選 ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className="w-8 h-1 rounded-full overflow-hidden bg-white/25"
              >
                {index < activeIndex ? (
                  <span className="block h-full w-full bg-primary" />
                ) : index === activeIndex && candidates.length > 1 ? (
                  <span
                    key={activeIndex}
                    className="block h-full bg-primary animate-hero-dash-fill"
                    style={{
                      animationPlayState:
                        playing || hovering || focused ? "paused" : "running",
                    }}
                  />
                ) : index === activeIndex ? (
                  <span className="block h-full w-full bg-primary" />
                ) : (
                  <span className="block h-full w-0 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default Hero;
