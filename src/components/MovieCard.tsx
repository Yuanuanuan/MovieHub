import { MovieInfo } from "@/utils/module";
import { Link } from "react-router-dom";
import FavoriteButton from "@/components/FavoriteButton";

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
          className="absolute -left-2 -bottom-3 z-0 font-bebas text-white/10 leading-none select-none pointer-events-none"
          style={{ fontSize: "88px" }}
        >
          {rank}
        </span>
      )}
      <Link to={`/movieDetails/${movie.id}`} className="relative z-10 block h-full">
        <img
          width={"100%"}
          height={"100%"}
          src={import.meta.env.VITE_IMAGE_URL + movie.poster_path}
          className="w-full h-full object-cover rounded-lg cursor-pointer shadow-xl shadow-gray-900 transition-all hover:scale-105 main-movie-card"
          alt="movie image"
        />
        <FavoriteButton
          movie={{
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
          }}
          className="absolute top-2 right-2 w-8 h-8"
        />
      </Link>
    </div>
  );
};

export default MainMovieCard;
