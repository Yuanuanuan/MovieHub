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
import { hasPoster } from "@/utils/image";

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

const SKELETON_COUNT = 6;

function HomeRowSkeleton() {
  return (
    <section className="mb-2">
      <div className="h-9 w-40 ml-4 mb-2 rounded bg-[#1c1c1f] animate-shimmer" />
      <div className="flex gap-3 px-4 py-4 overflow-hidden">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div
            key={i}
            className="flex-none w-36 sm:w-48 md:w-60 h-[220px] sm:h-[260px] md:h-[350px] rounded-[10px] bg-[#1c1c1f] animate-shimmer"
          />
        ))}
      </div>
    </section>
  );
}

function HomeRow({
  label,
  fetcher,
  numbered,
  isFirstRow,
}: RowConfig & { isFirstRow: boolean }) {
  const [movies, setMovies] = useState<MovieInfo[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetcher().then((results) => {
      if (!cancelled) setMovies(results.filter(hasPoster));
    });
    return () => {
      cancelled = true;
    };
  }, [fetcher]);

  if (movies === null) return <HomeRowSkeleton />;
  if (movies.length === 0) return null;

  return (
    <section className="mb-2">
      <h2 className="text-white text-4xl ml-4 mt-8 mb-2">{label}</h2>
      <Slide>
        {movies.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            rank={numbered ? index + 1 : undefined}
            loading={isFirstRow && index < 4 ? "eager" : "lazy"}
          />
        ))}
      </Slide>
    </section>
  );
}

function HomeRows() {
  return (
    <>
      {ROWS.map((row, index) => (
        <HomeRow key={row.label} {...row} isFirstRow={index === 0} />
      ))}
    </>
  );
}

export default HomeRows;
