import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import starIcon from "/star.svg";
import { getPopularMovieList, getMovieDetails } from "@/api/movie";
import FavoriteButton from "@/components/FavoriteButton";
import TrailerFacade from "@/components/TrailerFacade";
import { RouthPath } from "@/routers/router";
import { IMovieDetails, MovieInfo } from "@/utils/module";

function Hero() {
  const [candidates, setCandidates] = useState<MovieInfo[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeDetails, setActiveDetails] = useState<IMovieDetails | null>(
    null
  );

  useEffect(() => {
    getPopularMovieList(1).then((results: MovieInfo[]) => {
      setCandidates(results.filter((m) => m.backdrop_path).slice(0, 5));
    });
  }, []);

  useEffect(() => {
    const current = candidates[activeIndex];
    if (!current) return;
    let cancelled = false;
    getMovieDetails(current.id).then((res) => {
      if (!cancelled) setActiveDetails(res.data as IMovieDetails);
    });
    return () => {
      cancelled = true;
    };
  }, [candidates, activeIndex]);

  if (!activeDetails) return null;

  const backdropUrl =
    import.meta.env.VITE_IMAGE_URL + activeDetails.backdrop_path;
  const hours = Math.floor(activeDetails.runtime / 60) || 0;
  const mins = activeDetails.runtime % 60 || 0;

  return (
    <section className="relative w-full h-[70vh] max-h-[560px] overflow-hidden rounded-2xl mb-10">
      <div className="absolute inset-0">
        <img
          src={backdropUrl}
          alt={activeDetails.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10 max-w-2xl gap-3">
        <p className="uppercase tracking-widest text-sm text-slate-300 font-bebas">
          Featured This Week
        </p>
        <h1 className="text-3xl md:text-5xl font-bold">
          {activeDetails.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <span className="flex items-center gap-1 font-bold">
            <img src={starIcon} width={16} height={16} alt="star icon" />
            {activeDetails.vote_average.toFixed(1)}
          </span>
          <span>{activeDetails.release_date?.slice(0, 4)}</span>
          <span>·</span>
          <span>
            {hours}h {mins}min
          </span>
          <div className="flex flex-wrap gap-2">
            {activeDetails.genres.map((genre) => (
              <span
                key={genre.id}
                className="text-xs px-3 py-1 rounded-full border border-white/25"
              >
                {genre.name}
              </span>
            ))}
          </div>
        </div>
        <p className="text-slate-300 text-sm md:text-base line-clamp-2 max-w-xl">
          {activeDetails.overview}
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          {activeDetails.videos.results.length > 0 && (
            <div className="w-32 h-16 rounded-md overflow-hidden">
              <TrailerFacade
                videoKey={activeDetails.videos.results[0]?.key}
                posterUrl={backdropUrl}
              />
            </div>
          )}
          <Link
            to={`${RouthPath.details}/${activeDetails.id}`}
            className="py-2.5 px-6 rounded-md bg-white/10 border border-white/30 backdrop-blur-sm"
          >
            Details
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
              aria-label={`Featured ${index + 1}`}
              aria-current={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={`w-6 h-1 rounded-full ${
                index === activeIndex ? "bg-primary" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
