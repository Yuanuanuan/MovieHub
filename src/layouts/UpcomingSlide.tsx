import Slide from "@/components/Slide";
import { getUpcomingMovieList } from "@/api/movie";
import MovieCard from "@/components/MovieCard";
import { MovieInfo } from "@/utils/module";
import { useState, useEffect, useCallback } from "react";

function UpcomingSlide() {
  const [movieList, setMovieList] = useState<MovieInfo[]>([]);

  const fetchTopMovieData = useCallback(async (page = 1) => {
    const res = await getUpcomingMovieList(page);
    setMovieList(res);
  }, []);

  useEffect(() => {
    fetchTopMovieData();
  }, [fetchTopMovieData]);

  return (
    <>
      <h2 className="text-white text-5xl ml-4 mb-2">即將上映</h2>
      <Slide>
        <>
          {movieList?.length
            ? movieList.map((movie) => {
                return <MovieCard key={movie.id} movie={movie} />;
              })
            : null}
        </>
      </Slide>
      <hr className="hr m-10" />
    </>
  );
}

export default UpcomingSlide;
