import { useNavigate, useLocation } from "react-router-dom";
import { RouthPath } from "@/routers/router";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import BaseButton from "@/components/BaseButton";
import SearchIcon from "@/components/SearchIcon";
import Logo from "@/components/Logo";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<"home" | "favorite">("home");

  function handleGoHome() {
    navigate(RouthPath.home);
  }

  function handleSearch() {
    navigate(RouthPath.search);
  }

  useEffect(() => {
    if (location.pathname.includes("favorite")) {
      setCurrentPage("favorite");
      return;
    }
    setCurrentPage("home");
  }, [location]);

  return (
    <header className="w-auto h-20 px-6 flex justify-between items-center bg-black text-white">
      <div
        className="flex gap-4 items-center cursor-pointer"
        onClick={handleGoHome}
      >
        <Logo />
      </div>
      <div className="flex">
        <ul className="flex items-center gap-32">
          <li
            className={`text-2xl font-bold cursor-pointer font-Roboto ${
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
          <li
            className={`text-2xl font-bold cursor-pointer font-Roboto ${
              currentPage === "favorite" && "text-primary"
            }`}
          >
            <Link
              to={RouthPath.favorite}
              className="relative after:absolute after:w-full after:h-1 after:bg-primary after:bottom-[-5px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-500 after:ease-in-out hover:text-primary"
            >
              Favorite
            </Link>
          </li>
          <li onClick={handleSearch}>
            <SearchIcon className="w-8 h-8 fill-white cursor-pointer" />
          </li>
          <li>
            <BaseButton>
              <Link
                to={RouthPath.login}
                className="text-xl font-roboto font-semibold"
              >
                Sign In
              </Link>
            </BaseButton>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
