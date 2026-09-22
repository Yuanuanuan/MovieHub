import Logo from "@/components/Logo";
import igIcon from "/media/instagram.svg";
import xIcon from "/media/twitterX.svg";
import fbIcon from "/media/facebook.svg";

const Footer = () => {
  return (
    <footer className="w-full h-auto md:h-60 flex flex-col items-center py-6 md:py-0">
      <section className="w-full px-4 md:px-24 flex flex-col md:flex-row flex-1 justify-center md:justify-between items-center md:items-start gap-6 md:gap-0">
        <div>
          <Logo />
        </div>
        <div className="text-gray-400 text-xl">
          <ul className="flex gap-6 sm:gap-16 h-10">
            <li className="flex justify-center items-center cursor-pointer">
              Home
            </li>
            <li className="flex justify-center items-center cursor-pointer">
              TV
            </li>
            <li className="flex justify-center items-center cursor-pointer">
              Favorite
            </li>
          </ul>
        </div>
        <div className="h-10 flex items-center justify-center">
          <ul className="flex gap-4 cursor-pointer">
            <li>
              <img width={24} height={24} src={igIcon} alt="instagram icon" />
            </li>
            <li>
              <img width={24} height={24} src={fbIcon} alt="facebook icon" />
            </li>
            <li>
              <img width={24} height={24} src={xIcon} alt="twitterX icon" />
            </li>
          </ul>
        </div>
      </section>
      <h3 className="text-white -rotate-3 h-16">
        © 2024 MovieHub. All Rights Reserved
      </h3>
    </footer>
  );
};

export default Footer;
