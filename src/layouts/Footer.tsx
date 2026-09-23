import { Link } from "react-router-dom";
import { RouthPath } from "@/routers/router";
import Logo from "@/components/Logo";

const Footer = () => {
  return (
    <footer className="w-full h-auto border-t border-white/10 bg-black">
      <div className="w-full px-4 md:px-16 py-8 md:py-10 flex flex-col md:flex-row items-center md:items-center justify-center md:justify-between gap-6">
        <div>
          <Logo />
        </div>

        <ul className="flex items-center gap-8 sm:gap-12 text-base font-bold text-slate-300">
          <li>
            <Link to={RouthPath.home} className="transition-colors hover:text-primary">
              首頁
            </Link>
          </li>
          <li>
            <Link to={RouthPath.favorite} className="transition-colors hover:text-primary">
              我的收藏
            </Link>
          </li>
        </ul>
      </div>

      <div className="border-t border-white/10 py-4 px-4">
        <p className="text-center text-xs text-slate-400">
          © 2026 MovieHub。版權所有。
        </p>
      </div>
    </footer>
  );
};

export default Footer;
