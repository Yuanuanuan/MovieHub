import { useEffect, useState } from "react";
import Slide from "@/components/Slide";
import MovieCard from "@/components/MovieCard";
import { getMoviesByGenre } from "@/api/movie";
import { MovieInfo } from "@/utils/module";

interface GenreRowProps {
  anchorId: string;
  label: string;
  genreId: number;
}

function GenreRow({ anchorId, label, genreId }: GenreRowProps) {
  const [movies, setMovies] = useState<MovieInfo[]>([]);

  useEffect(() => {
    getMoviesByGenre(genreId).then(setMovies);
  }, [genreId]);

  if (!movies.length) return <section id={anchorId} />;

  return (
    <section id={anchorId}>
      <h2 className="text-white text-4xl ml-4 mb-2">{label}</h2>
      <Slide>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </Slide>
      <hr className="hr m-10" />
    </section>
  );
}

function GenreRows() {
  return (
    <>
      <GenreRow anchorId="row-action" label="Action" genreId={28} />
      <GenreRow anchorId="row-comedy" label="Comedy" genreId={35} />
    </>
  );
}

export default GenreRows;
