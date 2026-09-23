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
  anchorId: string;
  label: string;
  fetcher: () => Promise<MovieInfo[]>;
  numbered?: boolean;
}

const ROWS: RowConfig[] = [
  {
    anchorId: "row-new",
    label: "最新上映",
    fetcher: () => getNowPlayingMovieList(),
  },
  {
    anchorId: "row-hot",
    label: "熱門電影",
    fetcher: () => getPopularMovieList(),
  },
  {
    anchorId: "row-top10",
    label: "TOP 10 本週",
    fetcher: () => getTopMovieList(),
    numbered: true,
  },
  {
    anchorId: "row-action",
    label: "動作片",
    fetcher: () => getMoviesByGenre(28),
  },
  {
    anchorId: "row-comedy",
    label: "喜劇片",
    fetcher: () => getMoviesByGenre(35),
  },
  {
    anchorId: "row-soon",
    label: "即將上映",
    fetcher: () => getUpcomingMovieList(),
  },
];

function HomeRow({ anchorId, label, fetcher, numbered }: RowConfig) {
  const [movies, setMovies] = useState<MovieInfo[]>([]);

  useEffect(() => {
    fetcher().then(setMovies);
  }, [anchorId, fetcher]);

  if (!movies.length) return <section id={anchorId} className="scroll-mt-24" />;

  return (
    <section id={anchorId} className="scroll-mt-24 mb-2">
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
        <HomeRow key={row.anchorId} {...row} />
      ))}
    </>
  );
}

export default HomeRows;
