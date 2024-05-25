import { useState, useEffect, useRef } from "react";
import MovieCard from "../components/MainMovieCard";
import LeftButton from "../components/LeftButton";
import RightButton from "../components/RightButton";
import { getUpcomingMovieList } from "../api/movie";
import useSlide from "@/hooks/useSlide";

const UpcomingSlide = () => {
  const slideRef = useRef<HTMLDivElement>(null);
  const [movieList, setMovieList] = useState<Record<string, string>[]>([]);
  const {
    leftBtnVariable,
    rightBtnVariable,
    handleClickLeft,
    handleClickRight,
  } = useSlide(slideRef);

  async function fetchTopMovieData(page = 1) {
    const res = await getUpcomingMovieList(page);
    setMovieList(res);
  }

  useEffect(() => {
    fetchTopMovieData();
  }, []);

  return (
    <>
      <h2 className="text-white text-5xl ml-4 mb-2">即將上映</h2>
      <section className="relative no-scrollbar">
        {leftBtnVariable && <LeftButton handleClickLeft={handleClickLeft} />}
        <div
          ref={slideRef}
          className="px-4 py-4 grid grid-flow-col gap-3 overflow-scroll no-scrollbar"
        >
          {movieList?.length
            ? movieList.map((movie) => {
                return <MovieCard key={movie.id} movie={movie} />;
              })
            : null}
        </div>
        {rightBtnVariable && (
          <RightButton handleClickRight={handleClickRight} />
        )}
      </section>
      <hr className="hr m-10" />
    </>
  );
};

export default UpcomingSlide;
