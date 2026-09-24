import { useNavigate, useLocation, Link } from "react-router-dom";
import { RouthPath } from "@/routers/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SearchIcon from "@/components/SearchIcon";
import Logo from "@/components/Logo";
import { FavoriteMovie } from "@/utils/module";
import { CURATED_GENRES } from "@/constants/genres";

interface FavoritesSelectorType {
  favorites: { items: FavoriteMovie[] };
}

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<"home" | "favorite" | "other">(
    "home",
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const favoriteCount = useSelector(
    (state: FavoritesSelectorType) => state.favorites.items.length,
  );

  function handleGoHome() {
    navigate(RouthPath.home);
    setMobileMenuOpen(false);
  }

  function handleSearch() {
    navigate(RouthPath.search);
    setMobileMenuOpen(false);
  }

  function handleGenreClick(genreId: number) {
    navigate(`${RouthPath.home}?genre=${genreId}`);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    if (location.pathname.includes("favorite")) {
      setCurrentPage("favorite");
    } else if (location.pathname === RouthPath.home) {
      setCurrentPage("home");
    } else {
      setCurrentPage("other");
    }
  }, [location]);

  return (
    <header className="w-auto px-4 md:px-6 h-20 flex justify-between items-center bg-black text-white sticky top-0 z-50">
      <div className="absolute top-full left-0 right-0 h-[30px] bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
      <div
        className="flex gap-4 items-center cursor-pointer"
        onClick={handleGoHome}
      >
        <Logo />
      </div>

      <ul className="hidden md:flex items-center gap-[26px]">
        <li>
          <Link
            to={RouthPath.home}
            className={`relative flex items-center py-1.5 text-[15px] font-bold transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:bg-primary after:transition-transform after:duration-300 after:ease-in-out hover:text-white ${
              currentPage === "home"
                ? "text-white after:scale-x-100"
                : "text-slate-400 after:scale-x-0 hover:after:scale-x-100"
            }`}
          >
            首頁
          </Link>
        </li>
        <li>
          <Link
            to={RouthPath.favorite}
            className={`relative flex items-center gap-2 py-1.5 text-[15px] font-bold transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:bg-primary after:transition-transform after:duration-300 after:ease-in-out hover:text-white ${
              currentPage === "favorite"
                ? "text-white after:scale-x-100"
                : "text-slate-400 after:scale-x-0 hover:after:scale-x-100"
            }`}
          >
            我的收藏
            {favoriteCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {favoriteCount}
              </span>
            )}
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={handleSearch}
            aria-label="搜尋"
            className="flex items-center justify-center w-[38px] h-[38px] rounded-[10px] text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <SearchIcon className="w-[19px] h-[19px] fill-current" />
          </button>
        </li>
      </ul>

      <button
        type="button"
        onClick={() => setMobileMenuOpen((open) => !open)}
        aria-label={mobileMenuOpen ? "關閉選單" : "開啟選單"}
        aria-expanded={mobileMenuOpen}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-[10px] text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
      >
        {mobileMenuOpen ? (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7l-1.4-1.4L9.2 12 2.9 5.7l1.4-1.4L10.6 10.6l6.3-6.3z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
          </svg>
        )}
      </button>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black border-t border-white/10 flex flex-col p-4 gap-3 z-50">
          <button
            type="button"
            className="text-left text-[15px] font-bold text-slate-200"
            onClick={handleGoHome}
          >
            首頁
          </button>
          <Link
            to={RouthPath.favorite}
            className="text-[15px] font-bold text-slate-200"
            onClick={() => setMobileMenuOpen(false)}
          >
            我的收藏{favoriteCount > 0 ? `(${favoriteCount})` : ""}
          </Link>
          <button
            type="button"
            className="text-left text-[15px] font-bold text-slate-200"
            onClick={handleSearch}
          >
            搜尋
          </button>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
            {CURATED_GENRES.map((genre) => (
              <button
                key={genre.id}
                type="button"
                onClick={() => handleGenreClick(genre.id)}
                className="text-sm px-3 py-1.5 rounded-full border border-white/20"
              >
                {genre.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
