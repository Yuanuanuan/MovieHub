import { MovieCast } from "@/utils/module";
import menImg from "/men.jpg";
import womenImg from "/women.jfif";

function CastCard({ person }: { person: MovieCast }) {
  let personImg = import.meta.env.VITE_IMAGE_URL + person.profile_path;

  if (!person.profile_path) {
    if (person.gender === 1) {
      personImg = womenImg;
    } else {
      personImg = menImg;
    }
  }

  return (
    <div className="w-[240px] h-fit rounded-2xl">
      <div className="w-full h-[320px]">
        <img
          src={personImg}
          alt="person image"
          className="w-full h-full object-cover rounded-t-2xl"
        />
      </div>
      <div className="h-24 p-2 bg-white text-black  rounded-b-2xl">
        <h4 className="text-lg font-semibold">{person.name}</h4>
        <h5 className="text-sm text-[#666]">{person.character}</h5>
      </div>
    </div>
  );
}

export default CastCard;
