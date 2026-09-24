import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import starIcon from "/star.svg";
import CastSlide from "@/layouts/CastSlide";
import Slide from "@/components/Slide";
import MovieCard from "@/components/MovieCard";
import FavoriteButton from "@/components/FavoriteButton";
import BackButton from "@/components/BackButton";
import TrailerFacade from "@/components/TrailerFacade";
import { getMovieRecommendations } from "@/api/movie";
import { MovieInfoRes, IMovieDetails, MovieInfo } from "@/utils/module";
import { getGenreName } from "@/constants/genres";
import { getPosterUrl, getBackdropUrl, hasPoster } from "@/utils/image";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

function MovieDetails() {
  const res = useLoaderData() as MovieInfoRes;
  const info = res.data as IMovieDetails;
  const [recommendations, setRecommendations] = useState<MovieInfo[]>([]);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMovieRecommendations(info.id).then((results) => {
      if (!cancelled)
        setRecommendations((results as MovieInfo[]).filter(hasPoster));
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
    return `${hours}小時${mins}分`;
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
        <ImageWithSkeleton
          src={getBackdropUrl(info.backdrop_path)}
          alt={info.title}
          loading="eager"
          className="w-full h-full"
          imgClassName="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <BackButton className="absolute top-4 left-4 z-10" />
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 px-4 md:px-16">
        <div className="flex-none w-28 md:w-[200px] -mt-16 md:-mt-20 relative z-10">
          <ImageWithSkeleton
            src={getPosterUrl(info.poster_path)}
            alt={info.title}
            loading="eager"
            className="w-full aspect-[2/3] rounded-lg shadow-2xl border-4 border-black"
            imgClassName="w-full h-full object-cover rounded-lg"
          />
        </div>

        <div className="flex-1 flex flex-col gap-4 pt-4">
          <h1 className="text-[32px] md:text-[44px] font-black leading-tight">
            {info.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span className="flex items-center gap-1 font-bold">
              <img width={16} height={16} src={starIcon} alt="星星圖示" />
              {getRating(info.vote_average)}
            </span>
            <span>{info.release_date}</span>
            <span>·</span>
            <span>{getRuntime()}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {info.genres.map((genre) => (
              <span
                key={genre.id}
                className="text-xs px-3 py-1 rounded-full border border-white/20 text-slate-300"
              >
                {getGenreName(genre)}
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
              {shareCopied ? "已複製！" : "分享"}
            </button>
          </div>
          <p className="text-base leading-7 text-slate-300 max-w-2xl">
            {info.overview || "暫無簡介資料。"}
          </p>
        </div>
      </div>

      {info.videos.results.length > 0 && (
        <div className="px-4 md:px-16 mt-8">
          <div className="aspect-video max-h-[80vh] mx-auto rounded-xl overflow-hidden">
            <TrailerFacade
              videoKey={info.videos.results[0]?.key}
              posterUrl={getBackdropUrl(info.backdrop_path) ?? ""}
            />
          </div>
        </div>
      )}

      <div className="mt-16 mb-8">
        <CastSlide cast={info.credits.cast} />
      </div>
      {recommendations.length > 0 && (
        <div className="mb-10">
          <h3 className="text-4xl ml-4 mb-6">看過這部的人也喜歡</h3>
          <Slide>
            {recommendations.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                size="compact"
                loading="lazy"
              />
            ))}
          </Slide>
        </div>
      )}
    </main>
  );
}

export default MovieDetails;
