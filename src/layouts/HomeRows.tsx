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
    label: "New Releases",
    fetcher: () => getNowPlayingMovieList(),
  },
  {
    anchorId: "row-hot",
    label: "Popular",
    fetcher: () => getPopularMovieList(),
  },
  {
    anchorId: "row-top10",
    label: "Top 10 This Week",
    fetcher: () => getTopMovieList(),
    numbered: true,
  },
  {
    anchorId: "row-action",
    label: "Action",
    fetcher: () => getMoviesByGenre(28),
  },
  {
    anchorId: "row-comedy",
    label: "Comedy",
    fetcher: () => getMoviesByGenre(35),
  },
  {
    anchorId: "row-soon",
    label: "Coming Soon",
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
