import { MovieCast } from "@/utils/module";
import menImg from "/men.jpg";
import womenImg from "/women.jfif";
import { Link } from "react-router-dom";

function CastCard({ person }: { person: MovieCast }) {
  const personImg = getPersonImage(person);

  return (
    <div className="w-32 h-fit flex flex-col items-center text-center">
      <Link
        to={`/person/${person.id}`}
        className="block w-28 h-28 rounded-full overflow-hidden shadow-lg"
      >
        <img
          src={personImg}
          alt="person image"
          className="w-full h-full object-cover cursor-pointer"
        />
      </Link>
      <h4 className="text-sm font-bold text-white mt-3">{person.name}</h4>
      <h5 className="text-xs text-slate-400">{person.character}</h5>
    </div>
  );
}

export default CastCard;

/** 獲取演員圖像 */
function getPersonImage(person: MovieCast) {
  if (person.profile_path)
    return import.meta.env.VITE_IMAGE_URL + person.profile_path;

  if (person.gender === 1) {
    return womenImg;
  } else {
    return menImg;
  }
}
