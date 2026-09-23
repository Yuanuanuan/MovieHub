import { RouthPath } from "@/routers/router";
import { MovieInfo } from "@/utils/module";
import { useCallback, useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getNowPlayingMovieList, searchMovies } from "@/api/movie";

let timer: number;

function Search() {
  const navigate = useNavigate();
  const searchInput = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    searchInput.current?.focus();
  }, []);

  return (
    <section className="w-full h-full flex flex-col mb-20 text-white">
      <div className="w-full h-12 mb-6 flex items-center gap-3 px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="返回"
          className="flex-none w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M15 4l-8 8 8 8 1.4-1.4L9.8 12l6.6-6.6z" />
          </svg>
        </button>
        <input
          ref={searchInput}
          className="flex-1 max-w-[500px] mx-auto h-[45px] bg-white text-black rounded-[45px] pl-4 bg-transparent border-none outline-none text-xl"
          type="text"
          placeholder="搜尋電影名稱..."
          onChange={handleChange}
        />
        <div className="flex-none w-10" aria-hidden="true" />
      </div>
      <div className="px-4 w-full min-h-[85vh] flex flex-wrap gap-3 justify-center content-start">
        {movieList.length > 0 ? (
          movieList.map((movie) => {
            return (
              <div className="w-36 sm:w-48 md:w-60 h-[220px] sm:h-[260px] md:h-[320px]" key={movie.id}>
                <Link to={RouthPath.details + "/" + movie.id}>
                  <img
                    src={import.meta.env.VITE_IMAGE_URL + movie.poster_path}
                    alt="電影海報"
                    className="w-36 sm:w-48 md:w-60 h-[220px] sm:h-[260px] md:h-[320px] object-cover rounded-md"
                  />
                </Link>
              </div>
            );
          })
        ) : (
          <div className="w-full h-[85vh] flex justify-center items-center">
            <h6 className="font-semibold text-4xl">找不到符合的電影。</h6>
          </div>
        )}
      </div>
    </section>
  );
}

export default Search;
