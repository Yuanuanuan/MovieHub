import { useNavigate, useLocation } from "react-router-dom";
import { RouthPath } from "@/routers/router";
import { Link } from "react-router-dom";
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
  const [currentPage, setCurrentPage] = useState<"home" | "favorite">("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const favoriteCount = useSelector(
    (state: FavoritesSelectorType) => state.favorites.items.length
  );

  function handleGoHome() {
    navigate(RouthPath.home);
    setMobileMenuOpen(false);
  }

  function handleSearch() {
    navigate(RouthPath.search);
    setMobileMenuOpen(false);
  }

  function handleGenreClick(anchor: string) {
    navigate(`${RouthPath.home}#${anchor}`);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    if (location.pathname.includes("favorite")) {
      setCurrentPage("favorite");
      return;
    }
    setCurrentPage("home");
  }, [location]);

  return (
    <header className="w-auto px-4 md:px-6 h-20 flex justify-between items-center bg-[linear-gradient(#141414_55%,transparent)] text-white sticky top-0 z-50">
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
        <li className="group relative">
          <button
            type="button"
            className="flex items-center gap-1 py-1.5 text-[15px] font-bold text-slate-400 transition-colors hover:text-white"
          >
            分類
            <svg
              viewBox="0 0 24 24"
              width="11"
              height="11"
              fill="currentColor"
              className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity">
            <div className="bg-black border border-white/10 rounded-lg p-2 grid grid-cols-2 gap-1 w-64">
              {CURATED_GENRES.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => handleGenreClick(genre.anchor)}
                  className="text-left text-sm px-2 py-1.5 rounded hover:bg-white/10 whitespace-nowrap"
                >
                  {genre.label}
                </button>
              ))}
            </div>
          </div>
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

      <div className="flex items-center gap-1">
        <Link
          to={RouthPath.favorite}
          aria-label="我的收藏"
          className="relative w-[38px] h-[38px] flex items-center justify-center rounded-[10px] text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            width="19"
            height="19"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.5 4A5.4 5.4 0 0 1 12 7a5.4 5.4 0 0 1 6.5-3c3.5.5 5 4 3.5 7.7C19.5 16.4 12 21 12 21z" />
          </svg>
          {favoriteCount > 0 && (
            <span className="absolute top-0 right-0 min-w-[16px] h-[16px] px-1 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
              {favoriteCount}
            </span>
          )}
        </Link>

        <button
          type="button"
          className="md:hidden w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="選單"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          </svg>
        </button>
      </div>

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
                onClick={() => handleGenreClick(genre.anchor)}
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
