import { useEffect, useState } from "react";
import { getMoviesByGenre } from "@/api/movie";
import { MovieInfo } from "@/utils/module";
import MovieCard from "@/components/MovieCard";
import { CURATED_GENRES } from "@/constants/genres";

function GenreResults({ genreId }: { genreId: number }) {
  const [movies, setMovies] = useState<MovieInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMoviesByGenre(genreId).then((results) => {
      if (!cancelled) {
        setMovies(results);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [genreId]);

  const label = CURATED_GENRES.find((g) => g.id === genreId)?.label ?? "分類";

  return (
    <section>
      <h2 className="text-white text-4xl mb-6">{label}</h2>
      {!loading && movies.length === 0 ? (
        <div className="w-full h-[50vh] flex items-center justify-center">
          <p className="text-slate-400 text-lg">這個分類目前沒有電影。</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}

export default GenreResults;
