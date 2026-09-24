import { useCallback, useEffect, useRef, useState } from "react";
import { getMoviesByGenreWithMeta } from "@/api/movie";
import { MovieInfo } from "@/utils/module";
import { hasPoster } from "@/utils/image";
import MovieCard from "@/components/MovieCard";
import { CURATED_GENRES } from "@/constants/genres";

function GenreResults({ genreId }: { genreId: number }) {
  const [movies, setMovies] = useState<MovieInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const requestIdRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(
    (page: number, replace: boolean) => {
      const requestId = ++requestIdRef.current;
      loadingRef.current = true;
      setLoading(true);
      getMoviesByGenreWithMeta(genreId, page).then(
        ({ results, totalPages }) => {
          if (requestIdRef.current !== requestId) return;
          const filtered = (results as MovieInfo[]).filter(hasPoster);
          setMovies((prev) => (replace ? filtered : [...prev, ...filtered]));
          setHasMore(page < totalPages);
          pageRef.current = page;
          loadingRef.current = false;
          setLoading(false);
        },
      );
    },
    [genreId],
  );

  useEffect(() => {
    setMovies([]);
    setHasMore(true);
    pageRef.current = 1;
    loadPage(1, true);
  }, [genreId, loadPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (loadingRef.current || !hasMore) return;
        loadPage(pageRef.current + 1, false);
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadPage]);

  const label = CURATED_GENRES.find((g) => g.id === genreId)?.label ?? "分類";

  return (
    <section>
      <h2 className="text-white text-4xl mt-8 mb-6">{label}</h2>
      {!loading && movies.length === 0 ? (
        <div className="w-full h-[50vh] flex items-center justify-center">
          <p className="text-slate-400 text-lg">這個分類目前沒有電影。</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} loading="lazy" />
            ))}
          </div>
          {hasMore && <div ref={sentinelRef} className="h-2 w-full" />}
        </>
      )}
    </section>
  );
}

export default GenreResults;
