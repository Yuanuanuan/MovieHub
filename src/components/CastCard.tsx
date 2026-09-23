import { MovieCast } from "@/utils/module";
import menImg from "/men.jpg";
import womenImg from "/women.jfif";
import { Link } from "react-router-dom";

function CastCard({ person }: { person: MovieCast }) {
  const personImg = getPersonImage(person);

  return (
    <Link
      to={`/person/${person.id}`}
      className="group w-40 h-fit flex flex-col items-center text-center"
    >
      <div className="w-40 h-40 rounded-full overflow-hidden shadow-lg outline outline-2 outline-transparent outline-offset-4 transition-all duration-300 group-hover:outline-primary group-hover:scale-105">
        <img
          src={personImg}
          alt="演員照片"
          className="w-full h-full object-cover"
        />
      </div>
      <h4 className="text-base font-bold text-white mt-3 group-hover:text-primary transition-colors">
        {person.name}
      </h4>
      <h5 className="text-sm text-slate-400">
        {person.character ? `飾 ${person.character}` : ""}
      </h5>
    </Link>
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
