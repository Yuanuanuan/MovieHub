import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import MovieCard from "@/components/MovieCard";
import { RouthPath } from "@/routers/router";
import { FavoriteMovie } from "@/utils/module";

interface FavoritesSelectorType {
  favorites: { items: FavoriteMovie[] };
}

function Favorite() {
  const items = useSelector(
    (state: FavoritesSelectorType) => state.favorites.items
  );

  return (
    <section className="w-full min-h-[70vh] text-white px-4 md:px-16 pb-16">
      <div className="flex items-baseline justify-between flex-wrap gap-2 py-8">
        <h1 className="text-4xl font-bold">我的片單</h1>
        <span className="text-slate-400">{`${items.length} 部電影已收藏`}</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-4 py-16 px-8 mx-auto max-w-md border border-dashed border-white/20 rounded-2xl text-slate-400">
          <svg
            viewBox="0 0 24 24"
            width="40"
            height="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.5 4A5.4 5.4 0 0 1 12 7a5.4 5.4 0 0 1 6.5-3c3.5.5 5 4 3.5 7.7C19.5 16.4 12 21 12 21z" />
          </svg>
          <h3 className="text-white text-xl font-bold">
            你還沒有收藏任何電影
          </h3>
          <p className="max-w-sm">
            在海報右上角點擊愛心，之後就能在這裡快速回顧想看的片單。
          </p>
          <Link
            to={RouthPath.home}
            className="mt-2 py-3 px-7 rounded-md bg-primary text-white"
          >
            瀏覽電影
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {items.map((favorite) => (
            <MovieCard
              key={favorite.id}
              movie={{
                id: favorite.id,
                title: favorite.title,
                poster_path: favorite.poster_path,
                vote_average: favorite.vote_average,
                backdrop_path: "",
                overview: "",
                release_date: "",
                runtime: 0,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Favorite;
