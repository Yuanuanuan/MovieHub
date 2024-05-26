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
      alt: "facebook icon",
    },
    {
      id: externalIds.imdb_id,
      url: import.meta.env.VITE_IMDB_URL,
      icon: imdbIcon,
      alt: "imdb icon",
    },
    {
      id: externalIds.instagram_id,
      url: import.meta.env.VITE_INSTAGRAM_URL,
      icon: igIcon,
      alt: "instagram icon",
    },
    {
      id: externalIds.tiktok_id,
      url: import.meta.env.VITE_TIKTOK_URL,
      icon: tiktokIcon,
      alt: "tiktok icon",
    },
    {
      id: externalIds.twitter_id,
      url: import.meta.env.VITE_X_URL,
      icon: xIcon,
      alt: "X icon",
    },
    {
      id: externalIds.wikidata_id,
      url: import.meta.env.VITE_WIKI_URL,
      icon: wikiIcon,
      alt: "wikipedia icon",
    },
    {
      id: externalIds.youtube_id,
      url: import.meta.env.VITE_YOUTUBE_URL_FOR_USER,
      icon: ytIcon,
      alt: "youtube icon",
    },
  ];

  return (
    <div className="flex flex-col">
      <h5 className="text-xl mb-6 font-bold flex items-center">社群媒體:</h5>
      <ul className="flex gap-8">
        {socialMediaList.map((media, index) => {
          return (
            media.id && (
              <li key={index} className="hover:-scale-y-110">
                <Link to={media.url + media.id} target="_blank">
                  <img
                    width={48}
                    height={48}
                    src={media.icon}
                    alt={media.alt}
                  />
                </Link>
              </li>
            )
          );
        })}
      </ul>
    </div>
  );
}

export default SocialMedia;
