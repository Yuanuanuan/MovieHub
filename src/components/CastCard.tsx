import { MovieCast } from "@/utils/module";
import menImg from "/men.jpg";
import womenImg from "/women.jfif";
import { getPersonDetails } from "@/api/person";
import { Link } from "react-router-dom";

function CastCard({ person }: { person: MovieCast }) {
  const personImg = getPersonImage(person);

  async function handleClick() {
    const res = await getPersonDetails(person.id);
    console.log(res);
  }

  return (
    <div className="w-[240px] h-fit rounded-2xl" onClick={handleClick}>
      <div className="w-full h-[320px]">
        <Link to={`/person/${person.id}`}>
          <img
            src={personImg}
            alt="person image"
            className="w-full h-full object-cover rounded-t-2xl cursor-pointer"
          />
        </Link>
      </div>
      <div className="h-24 p-2 bg-white text-black  rounded-b-2xl">
        <h4 className="text-lg font-semibold">{person.name}</h4>
        <h5 className="text-sm text-[#666]">{person.character}</h5>
      </div>
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
