import { useState, useEffect, useRef } from "react";
import MovieCard from "../components/MovieCard";
import LeftButton from "../components/LeftButton";
import RightButton from "../components/RightButton";
import { getUpcomingMovieList } from "../api/service";

const UpcomingSlide = () => {
  const slideRef = useRef<HTMLDivElement>(null);
  const [movieList, setMovieList] = useState<Record<string, string>[]>([]);

  function handleClickLeft() {
    if (slideRef.current) {
      slideRef.current.scrollBy({
        left: -1000,
        behavior: "smooth",
      });
    }
  }

  function handleClickRight() {
    if (slideRef.current) {
      slideRef.current.scrollBy({
        left: 1000,
        behavior: "smooth",
      });
    }
  }

  async function fetchTopMovieData() {
    const res = await getUpcomingMovieList();
    setMovieList(res);
  }

  useEffect(() => {
    fetchTopMovieData();
  }, []);

  return (
    <section className="relative no-scrollbar">
      <LeftButton handleClickLeft={handleClickLeft} />
      <div
        ref={slideRef}
        className="px-4 grid grid-flow-col gap-3 overflow-scroll no-scrollbar"
      >
        {movieList?.length
          ? movieList.map((movie) => {
              return (
                <MovieCard
                  key={movie.id}
                  title={movie.title}
                  src={import.meta.env.VITE_IMAGE_URL + movie.poster_path}
                  release_date={movie.release_date}
                />
              );
            })
          : null}
      </div>
      <RightButton handleClickRight={handleClickRight} />
    </section>
  );
};

export default UpcomingSlide;
