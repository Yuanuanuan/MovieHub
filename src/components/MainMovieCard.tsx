import { Link } from "react-router-dom";

const MainMovieCard = ({
  movie,
}: {
  movie: Record<string, string | number>;
}) => {
  return (
    <div key={movie.id} className="w-60 h-[350px] relative main-wrapper">
      <Link to={`/movieDetails/${movie.id}`}>
        <img
          src={import.meta.env.VITE_IMAGE_URL + movie.poster_path}
          className={`w-full h-full object-cover rounded-lg cursor-pointer shadow-xl shadow-gray-900 transition-all hover:scale-105 not:hover:scale-90 main-movie-card`}
          alt="movie image"
        />
      </Link>
    </div>
  );
};

export default MainMovieCard;
