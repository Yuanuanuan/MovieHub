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
    <header className="w-auto px-4 md:px-6 h-20 flex justify-between items-center bg-black/95 backdrop-blur-sm text-white sticky top-0 z-50">
      <div
        className="flex gap-4 items-center cursor-pointer"
        onClick={handleGoHome}
      >
        <Logo />
      </div>

      <ul className="hidden md:flex items-center gap-10 lg:gap-16">
        <li
          className={`text-xl font-bold cursor-pointer font-roboto ${
            currentPage === "home" && "text-primary"
          }`}
        >
          <Link
            to={RouthPath.home}
            className="relative after:absolute after:w-full after:h-1 after:bg-primary after:bottom-[-5px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-500 after:ease-in-out hover:text-primary"
          >
            Home
          </Link>
        </li>
        <li className="group relative">
          <button
            type="button"
            className="text-xl font-bold font-roboto flex items-center gap-1"
          >
            Genres
            <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity">
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
        <li
          className={`text-xl font-bold cursor-pointer font-roboto ${
            currentPage === "favorite" && "text-primary"
          }`}
        >
          <Link to={RouthPath.favorite} className="relative flex items-center gap-2">
            Favorite
            {favoriteCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {favoriteCount}
              </span>
            )}
          </Link>
        </li>
        <li onClick={handleSearch}>
          <SearchIcon className="w-7 h-7 fill-white cursor-pointer" />
        </li>
      </ul>

      <div className="flex items-center gap-1">
        <Link
          to={RouthPath.favorite}
          aria-label="Favorites"
          className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
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
          className="md:hidden w-10 h-10 flex items-center justify-center"
          aria-label="Menu"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black border-t border-white/10 flex flex-col p-4 gap-3 z-50">
          <button type="button" className="text-left text-lg font-bold" onClick={handleGoHome}>
            Home
          </button>
          <Link
            to={RouthPath.favorite}
            className="text-lg font-bold"
            onClick={() => setMobileMenuOpen(false)}
          >
            Favorite{favoriteCount > 0 ? `(${favoriteCount})` : ""}
          </Link>
          <button type="button" className="text-left text-lg font-bold" onClick={handleSearch}>
            Search
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
