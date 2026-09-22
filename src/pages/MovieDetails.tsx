import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import starIcon from "/star.svg";
import CastSlide from "@/layouts/CastSlide";
import Slide from "@/components/Slide";
import MovieCard from "@/components/MovieCard";
import FavoriteButton from "@/components/FavoriteButton";
import TrailerFacade from "@/components/TrailerFacade";
import { getMovieRecommendations } from "@/api/movie";
import { MovieInfoRes, IMovieDetails, MovieInfo } from "@/utils/module";
import HeaderWithBack from "@/components/HeaderWithBack";

function MovieDetails() {
  const res = useLoaderData() as MovieInfoRes;
  const info = res.data as IMovieDetails;
  const [recommendations, setRecommendations] = useState<MovieInfo[]>([]);

  useEffect(() => {
    let cancelled = false;
    getMovieRecommendations(info.id).then((results) => {
      if (!cancelled) setRecommendations(results);
    });
    return () => {
      cancelled = true;
    };
  }, [info.id]);

  return (
    <main className="w-full h-full text-white mb-16 px-4 md:px-16">
      <HeaderWithBack />
      <div className="w-full flex flex-col md:flex-row md:h-[70vh]">
        <DetailsLeftSide info={info} />
        <DetailsRightSide info={info} />
      </div>
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

function DetailsLeftSide({ info }: { info: IMovieDetails }) {
  function getRating(rate: number) {
    return rate.toFixed(2);
  }

  function getRuntime() {
    const hours = Math.floor(info.runtime / 60) || 0;
    const mins = info.runtime % 60 || 0;
    return `${hours}h ${mins}min`;
  }

  return (
    <div className="w-full md:w-[40%] flex flex-col px-6 overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-[36px] md:text-[48px] mb-4">{info.title}</h1>
        <FavoriteButton
          movie={{
            id: info.id,
            title: info.title,
            poster_path: info.poster_path,
            vote_average: info.vote_average,
          }}
          className="w-11 h-11 flex-none mt-2"
        />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {info.genres.map((genre) => (
          <span
            key={genre.id}
            className="text-xs px-3 py-1 rounded-full border border-white/20 text-slate-300"
          >
            {genre.name}
          </span>
        ))}
      </div>
      <h2 className="text-lg my-2">
        Release Date:
        <span className="text-slate-400 ml-4">{info.release_date}</span>
      </h2>
      <h4 className="text-md tracking-wider mb-2">{getRuntime()}</h4>
      <h3 className="flex items-center mb-6">
        <img
          width={24}
          height={24}
          src={starIcon}
          className="mr-2"
          alt="star icon"
        />
        {getRating(info.vote_average)} / 10
      </h3>
      <div className="details-scroll overflow-y-scroll">
        <p className="text-xl leading-9">
          {info.overview || "No description available."}
        </p>
      </div>
    </div>
  );
}

function DetailsRightSide({ info }: { info: IMovieDetails }) {
  return (
    <div className="flex-1 flex justify-center min-h-[260px] md:min-h-0 mt-6 md:mt-0">
      {info.videos.results.length ? (
        <TrailerFacade
          videoKey={info.videos.results[0]?.key}
          posterUrl={import.meta.env.VITE_IMAGE_URL + info.backdrop_path}
        />
      ) : (
        <div className="w-[60%]">
          <img
            src={import.meta.env.VITE_IMAGE_URL + info.poster_path}
            alt="movie poster"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}

export default MovieDetails;
