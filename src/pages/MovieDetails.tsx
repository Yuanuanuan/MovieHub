import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import starIcon from "/star.svg";
import CastSlide from "@/layouts/CastSlide";
import Slide from "@/components/Slide";
import MovieCard from "@/components/MovieCard";
import FavoriteButton from "@/components/FavoriteButton";
import TrailerFacade from "@/components/TrailerFacade";
import { getMovieRecommendations } from "@/api/movie";
import { MovieInfoRes, IMovieDetails, MovieInfo } from "@/utils/module";

function MovieDetails() {
  const navigate = useNavigate();
  const res = useLoaderData() as MovieInfoRes;
  const info = res.data as IMovieDetails;
  const [recommendations, setRecommendations] = useState<MovieInfo[]>([]);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMovieRecommendations(info.id).then((results) => {
      if (!cancelled) setRecommendations(results);
    });
    return () => {
      cancelled = true;
    };
  }, [info.id]);

  function getRating(rate: number) {
    return rate.toFixed(2);
  }

  function getRuntime() {
    const hours = Math.floor(info.runtime / 60) || 0;
    const mins = info.runtime % 60 || 0;
    return `${hours}h ${mins}min`;
  }

  async function handleShare() {
    const shareData = { title: info.title, url: window.location.href };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(shareData.url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // clipboard unavailable or denied — silently no-op, matching the navigator.share branch above
    }
  }

  return (
    <main className="w-full h-full text-white mb-16">
      <div className="relative h-[220px] sm:h-[300px] mx-4 md:mx-16 rounded-2xl overflow-hidden">
        <img
          src={import.meta.env.VITE_IMAGE_URL + info.backdrop_path}
          alt={info.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 flex items-center gap-1.5 py-2 pl-2.5 pr-4 rounded-full bg-black/55 backdrop-blur-sm text-white text-sm font-bold"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M15 4l-8 8 8 8 1.4-1.4L9.8 12l6.6-6.6z" />
          </svg>
          Back
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 px-4 md:px-16">
        <div className="flex-none w-28 md:w-[200px] -mt-16 md:-mt-20 relative z-10">
          <img
            src={import.meta.env.VITE_IMAGE_URL + info.poster_path}
            alt={info.title}
            className="w-full aspect-[2/3] object-cover rounded-lg shadow-2xl border-4 border-black"
          />
        </div>

        <div className="flex-1 flex flex-col gap-4 pt-4">
          <h1 className="text-[32px] md:text-[44px] font-black leading-tight">
            {info.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span className="flex items-center gap-1 font-bold">
              <img width={16} height={16} src={starIcon} alt="star icon" />
              {getRating(info.vote_average)}
            </span>
            <span>{info.release_date?.slice(0, 4)}</span>
            <span>·</span>
            <span>{getRuntime()}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {info.genres.map((genre) => (
              <span
                key={genre.id}
                className="text-xs px-3 py-1 rounded-full border border-white/20 text-slate-300"
              >
                {genre.name}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <FavoriteButton
              variant="pill"
              movie={{
                id: info.id,
                title: info.title,
                poster_path: info.poster_path,
                vote_average: info.vote_average,
              }}
            />
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 py-2.5 px-5 rounded-md border border-white/25 text-white hover:border-white/50"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
              >
                <path d="M18 8a3 3 0 1 0-2.8-4H15a3 3 0 1 0 .2 4.6L9.9 11a3 3 0 1 0 0 2l5.3 2.4a3 3 0 1 0 .8-1.8L10.7 11a3 3 0 0 0 0-2l5.3-2.4c.3.2.6.3 1 .4z" />
              </svg>
              {shareCopied ? "Copied!" : "Share"}
            </button>
          </div>
          <p className="text-base leading-7 text-slate-300 max-w-2xl">
            {info.overview || "No description available."}
          </p>
        </div>
      </div>

      {info.videos.results.length > 0 && (
        <div className="px-4 md:px-16 mt-8">
          <div className="h-[220px] sm:h-[320px] rounded-xl overflow-hidden">
            <TrailerFacade
              videoKey={info.videos.results[0]?.key}
              posterUrl={import.meta.env.VITE_IMAGE_URL + info.backdrop_path}
            />
          </div>
        </div>
      )}

      <hr className="hr my-10" />
      <CastSlide cast={info.credits.cast} />
      {recommendations.length > 0 && (
        <>
          <hr className="hr my-10" />
          <h3 className="text-4xl ml-6 mb-6">You Might Also Like</h3>
          <Slide>
            {recommendations.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </Slide>
        </>
      )}
      <hr className="hr my-10" />
    </main>
  );
}

export default MovieDetails;
