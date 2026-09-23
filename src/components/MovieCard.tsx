import { MovieInfo } from "@/utils/module";
import { Link } from "react-router-dom";
import FavoriteButton from "@/components/FavoriteButton";
import starIcon from "/star.svg";

interface MainMovieCardProps {
  movie: MovieInfo;
  rank?: number;
}

const MainMovieCard = ({ movie, rank }: MainMovieCardProps) => {
  return (
    <div
      key={movie.id}
      className={`relative main-wrapper ${
        rank ? "pl-6" : ""
      } w-36 sm:w-48 md:w-60 h-[220px] sm:h-[260px] md:h-[350px]`}
    >
      {rank && (
        <span
          className="absolute -left-2 -bottom-3 z-0 font-bebas leading-none select-none pointer-events-none"
          style={{
            fontSize: "74px",
            color: "transparent",
            WebkitTextStroke: "2px rgba(33,33,38,0.9)",
          }}
        >
          {rank}
        </span>
      )}
      <Link
        to={`/movieDetails/${movie.id}`}
        className="group/card relative z-10 block h-full transition-opacity group-hover:opacity-70 hover:!opacity-100"
      >
        <div className="relative h-full rounded-[10px] overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:scale-105 hover:-translate-y-1">
          <img
            width={"100%"}
            height={"100%"}
            src={import.meta.env.VITE_IMAGE_URL + movie.poster_path}
            className="w-full h-full object-cover cursor-pointer shadow-xl shadow-gray-900 main-movie-card"
            alt="電影海報"
          />
          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none">
            <h3 className="text-sm font-bold text-white line-clamp-1">
              {movie.title}
            </h3>
            <span className="flex items-center gap-1 text-xs text-yellow-400 font-bold mt-1">
              <img src={starIcon} width={12} height={12} alt="星星圖示" />
              {movie.vote_average.toFixed(1)}
            </span>
          </div>
          <FavoriteButton
            movie={{
              id: movie.id,
              title: movie.title,
              poster_path: movie.poster_path,
              vote_average: movie.vote_average,
            }}
            className="absolute top-2 right-2 w-8 h-8 z-10"
          />
        </div>
      </Link>
    </div>
  );
};

export default MainMovieCard;
