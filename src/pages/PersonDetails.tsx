import HeaderWithBack from "@/components/HeaderWithBack";
import menImg from "/men.jpg";
import womenImg from "/women.jfif";
import maleIcon from "/male.svg";
import femaleIcon from "/female.svg";
import fbIcon from "/media/facebook.svg";
import imdbIcon from "/media/imdb.svg";
import igIcon from "/media/instagram.svg";
import tiktokIcon from "/media/tiktok.svg";
import xIcon from "/media/twitterX.svg";
import wikiIcon from "/media/wikipedia.svg";
import ytIcon from "/media/youtube.svg";
import { PersonInfoRes, PersonInfo, PersonExternalIds } from "@/utils/module";
import { useLoaderData } from "react-router-dom";
import { Link } from "react-router-dom";

function PersonDetails() {
  const res = useLoaderData() as PersonInfoRes;
  const personInfo = res.data as PersonInfo;

  return (
    <main className="w-full h-full text-white mb-16 px-16">
      <HeaderWithBack />
      <div className="w-full h-fit m-auto flex max-w-[1400px]">
        <img
          width={"40%"}
          height={"100%"}
          src={getPersonImage(personInfo)}
          className="max-w-[400px] object-cover rounded-2xl border-primary"
          style={{
            boxShadow: "-2px -2px 15px #252525, 2px 2px 15px #474747",
          }}
          alt="person image"
        />
        <div className="w-[60%] h-full pl-16">
          <h1 className="text-5xl">{personInfo.name}</h1>
          <hr className="hr my-8" />
          <h2 className="text-xl my-8 font-bold">
            生日:
            <span className=" ml-3 font-normal">{personInfo.birthday}</span>
          </h2>
          <h3 className="text-xl my-8 font-bold">
            出生地:
            <span className=" ml-3 font-normal">
              {personInfo.place_of_birth}
            </span>
          </h3>
          <h4 className="text-xl my-8 font-bold flex items-center">
            性別:
            <span className=" ml-3 font-normal">
              <img
                width={36}
                height={36}
                src={transGender(personInfo.gender)}
                alt=" gender"
              />
            </span>
          </h4>
          <SocialMedia externalIds={personInfo.external_ids} />
        </div>
      </div>
      <hr className="hr my-16" />
    </main>
  );
}

export default PersonDetails;

/** 獲取演員圖像 */
function getPersonImage(person: PersonInfo) {
  if (person.profile_path)
    return import.meta.env.VITE_IMAGE_URL + person.profile_path;

  if (person.gender === 1) {
    return womenImg;
  } else {
    return menImg;
  }
}

/** 獲取演員性別 */
function transGender(gender: 1 | 2) {
  if (gender === 2) {
    return maleIcon;
  }
  return femaleIcon;
}

/** 社群媒體部分 */
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
              <li key={index} className="hover:scale-110">
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
