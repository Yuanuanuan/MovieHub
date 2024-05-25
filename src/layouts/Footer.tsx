import Logo from "@/components/Logo";
import igIcon from "/media/instagram.svg";
import xIcon from "/media/twitterX.svg";
import fbIcon from "/media/facebook.svg";

const Footer = () => {
  return (
    <footer className="w-full h-60 flex flex-col items-center">
      <section className="w-full px-24 flex flex-1 justify-between items-start">
        <div>
          <Logo />
        </div>
        <div className="text-gray-400 text-xl">
          <ul className="flex gap-16 h-10">
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
        © 2024 Movie_Hub. All Rights Reserved
      </h3>
    </footer>
  );
};

export default Footer;
