import fbIcon from "/media/facebook.svg";
import imdbIcon from "/media/imdb.svg";
import igIcon from "/media/instagram.svg";
import tiktokIcon from "/media/tiktok.svg";
import xIcon from "/media/twitterX.svg";
import wikiIcon from "/media/wikipedia.svg";
import ytIcon from "/media/youtube.svg";
import { Link } from "react-router-dom";
import { PersonExternalIds } from "@/utils/module";

function SocialMedia({ externalIds }: { externalIds: PersonExternalIds }) {
  const socialMediaList = [
    {
      id: externalIds.facebook_id,
      url: import.meta.env.VITE_FACEBOOK_URL,
      icon: fbIcon,
      alt: "Facebook 圖示",
    },
    {
      id: externalIds.imdb_id,
      url: import.meta.env.VITE_IMDB_URL,
      icon: imdbIcon,
      alt: "IMDb 圖示",
    },
    {
      id: externalIds.instagram_id,
      url: import.meta.env.VITE_INSTAGRAM_URL,
      icon: igIcon,
      alt: "Instagram 圖示",
    },
    {
      id: externalIds.tiktok_id,
      url: import.meta.env.VITE_TIKTOK_URL,
      icon: tiktokIcon,
      alt: "TikTok 圖示",
    },
    {
      id: externalIds.twitter_id,
      url: import.meta.env.VITE_X_URL,
      icon: xIcon,
      alt: "X 圖示",
    },
    {
      id: externalIds.wikidata_id,
      url: import.meta.env.VITE_WIKI_URL,
      icon: wikiIcon,
      alt: "維基百科圖示",
    },
    {
      id: externalIds.youtube_id,
      url: import.meta.env.VITE_YOUTUBE_URL_FOR_USER,
      icon: ytIcon,
      alt: "YouTube 圖示",
    },
  ];

  return (
    <ul className="flex gap-2">
      {socialMediaList.map((media, index) => {
        return (
          media.id && (
            <li key={index}>
              <Link
                to={media.url + media.id}
                target="_blank"
                className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
              >
                <img width={18} height={18} src={media.icon} alt={media.alt} />
              </Link>
            </li>
          )
        );
      })}
    </ul>
  );
}

export default SocialMedia;
