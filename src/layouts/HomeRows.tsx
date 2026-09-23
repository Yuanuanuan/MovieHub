import { useEffect, useState } from "react";
import Slide from "@/components/Slide";
import MovieCard from "@/components/MovieCard";
import {
  getNowPlayingMovieList,
  getPopularMovieList,
  getTopMovieList,
  getMoviesByGenre,
  getUpcomingMovieList,
} from "@/api/movie";
import { MovieInfo } from "@/utils/module";

interface RowConfig {
  label: string;
  fetcher: () => Promise<MovieInfo[]>;
  numbered?: boolean;
}

const ROWS: RowConfig[] = [
  {
    label: "最新上映",
    fetcher: () => getNowPlayingMovieList(),
  },
  {
    label: "熱門電影",
    fetcher: () => getPopularMovieList(),
  },
  {
    label: "TOP 10 本週",
    fetcher: () => getTopMovieList(),
    numbered: true,
  },
  {
    label: "動作片",
    fetcher: () => getMoviesByGenre(28),
  },
  {
    label: "喜劇片",
    fetcher: () => getMoviesByGenre(35),
  },
  {
    label: "即將上映",
    fetcher: () => getUpcomingMovieList(),
  },
];

function HomeRow({ label, fetcher, numbered }: RowConfig) {
  const [movies, setMovies] = useState<MovieInfo[]>([]);

  useEffect(() => {
    fetcher().then(setMovies);
  }, [fetcher]);

  if (!movies.length) return null;

  return (
    <section className="mb-2">
      <h2 className="text-white text-4xl ml-4 mb-2">{label}</h2>
      <Slide>
        {movies.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            rank={numbered ? index + 1 : undefined}
          />
        ))}
      </Slide>
    </section>
  );
}

function HomeRows() {
  return (
    <>
      {ROWS.map((row) => (
        <HomeRow key={row.label} {...row} />
      ))}
    </>
  );
}

export default HomeRows;
