import logoIcon from "/logo.svg";
import favoriteIcon from "/favorite.svg";
import logoutIcon from "/logout.svg";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  function handleGoHome() {
    navigate("/");
  }

  return (
    <header className="w-auto h-16 px-6 flex justify-between items-center bg-black text-white">
      <div
        className="flex gap-4 items-center cursor-pointer"
        onClick={handleGoHome}
      >
        <img className="w-9 h-9" src={logoIcon} alt="logo icon" />
        <h1
          className={`ml-1 text-3xl text-[#ffe998] tracking-wider font-black font-playFair`}
        >
          Movie_Hub
        </h1>
      </div>
      <div className="flex gap-4">
        <img src={favoriteIcon} alt="favorite icon" />
        <img src={logoutIcon} alt="logout icon" />
      </div>
    </header>
  );
};

export default Header;
