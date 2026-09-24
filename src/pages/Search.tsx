import { RouthPath } from "@/routers/router";
import { MovieInfo } from "@/utils/module";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getNowPlayingMovieList, searchMovies } from "@/api/movie";
import { hasPoster, getPosterUrl } from "@/utils/image";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import SearchIcon from "@/components/SearchIcon";

const DEBOUNCE_MS = 500;

function Search() {
  const navigate = useNavigate();
  const searchInput = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [movieList, setMovieList] = useState<MovieInfo[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  function handleClear() {
    setSearch("");
    searchInput.current?.focus();
  }

  const fetchData = useCallback(
    async (signal: AbortSignal) => {
      try {
        const res = await searchMovies(search, 1, signal);
        if (res?.data.results) setMovieList(res.data.results.filter(hasPoster));
      } catch {
        // aborted by a newer keystroke, or the request failed — either way
        // a newer request (or the empty-query branch) will replace this state
      }
    },
    [search]
  );

  const fetchAllMovie = useCallback(async (signal: AbortSignal) => {
    try {
      const res = await getNowPlayingMovieList(1, signal);
      if (res) setMovieList(res.filter(hasPoster));
    } catch {
      // aborted or failed — ignore
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let debounceId: number | undefined;

    if (search.trim()) {
      debounceId = window.setTimeout(() => {
        fetchData(controller.signal);
      }, DEBOUNCE_MS);
    } else {
      fetchAllMovie(controller.signal);
    }

    return () => {
      window.clearTimeout(debounceId);
      controller.abort();
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
        <div className="relative flex-1 max-w-[500px] mx-auto">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 fill-slate-400 pointer-events-none" />
          <input
            ref={searchInput}
            value={search}
            type="text"
            inputMode="search"
            autoComplete="off"
            placeholder="搜尋電影名稱..."
            onChange={handleChange}
            className="w-full h-[45px] appearance-none bg-white/10 text-white placeholder:text-slate-400 rounded-full pl-11 pr-11 border border-white/15 outline-none transition-colors focus:border-primary focus:bg-white/15"
          />
          {search && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="清除搜尋"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7l-1.4-1.4L9.2 12 2.9 5.7l1.4-1.4L10.6 10.6l6.3-6.3z" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex-none w-10" aria-hidden="true" />
      </div>
      <div className="px-4 w-full min-h-[85vh] flex flex-wrap gap-3 justify-center content-start">
        {movieList.length > 0 ? (
          movieList.map((movie) => {
            return (
              <div className="w-36 sm:w-48 md:w-60 h-[220px] sm:h-[260px] md:h-[320px]" key={movie.id}>
                <Link to={RouthPath.details + "/" + movie.id}>
                  <ImageWithSkeleton
                    src={getPosterUrl(movie.poster_path)}
                    alt="電影海報"
                    loading="lazy"
                    className="w-36 sm:w-48 md:w-60 h-[220px] sm:h-[260px] md:h-[320px] rounded-md"
                    imgClassName="w-full h-full object-cover rounded-md"
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
