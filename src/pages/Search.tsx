import { RouthPath } from "@/routers/router";
import { MovieInfo } from "@/utils/module";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNowPlayingMovieList, searchMovies } from "@/api/movie";

let timer: number;

function Search() {
  const [search, setSearch] = useState("");
  const [movieList, setMovieList] = useState<MovieInfo[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  const fetchData = useCallback(async () => {
    const res = await searchMovies(search);
    if (res?.data.results) setMovieList(res?.data.results);
  }, [search]);

  const fetchAllMovie = useCallback(async () => {
    const res = await getNowPlayingMovieList();
    if (res) setMovieList(res);
  }, []);

  useEffect(() => {
    if (search) {
      timer = setTimeout(fetchData, 500);
    } else {
      fetchAllMovie();
    }

    return () => {
      clearTimeout(timer);
    };
  }, [fetchAllMovie, fetchData, search]);

  return (
    <section className="w-full h-full flex flex-col text-white">
      <div className="w-full h-12 mb-6 flex justify-center">
        <input
          className="w-[500px] h-[45px] bg-white text-black rounded-[45px] pl-4 bg-transparent border-none outline-none text-xl"
          type="text"
          placeholder="搜尋電影名稱..."
          onChange={handleChange}
        />
      </div>
      <div className="px-4 w-full min-h-[85vh] flex flex-wrap gap-3 justify-center content-start">
        {movieList.length > 0 ? (
          movieList.map((movie) => {
            return (
              <div className="w-60 h-[320px]" key={movie.id}>
                <Link to={RouthPath.details + "/" + movie.id}>
                  <img
                    src={import.meta.env.VITE_IMAGE_URL + movie.poster_path}
                    alt="movie poster"
                    className="w-60 h-[320px] object-cover rounded-md"
                  />
                </Link>
              </div>
            );
          })
        ) : (
          <div className="w-full h-[85vh] flex justify-center items-center">
            <h6 className="font-semibold text-4xl">對不起!找不到符合的電影</h6>
          </div>
        )}
      </div>
    </section>
  );
}

export default Search;
