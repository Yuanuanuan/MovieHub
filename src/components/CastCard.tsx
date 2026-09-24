import { memo } from "react";
import { MovieCast } from "@/utils/module";
import { Link } from "react-router-dom";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { getPersonImage } from "@/utils/person";

const CastCard = memo(function CastCard({ person }: { person: MovieCast }) {
  const personImg = getPersonImage(person);

  return (
    <Link
      to={`/person/${person.id}`}
      className="group/cast w-40 h-fit flex flex-col items-center text-center"
    >
      <div className="w-40 h-40 rounded-full overflow-hidden shadow-lg outline outline-2 outline-transparent outline-offset-4 transition-all duration-300 group-hover/cast:outline-primary group-hover/cast:scale-105">
        <ImageWithSkeleton
          src={personImg}
          alt="演員照片"
          loading="lazy"
          className="w-full h-full"
          imgClassName="w-full h-full object-cover"
        />
      </div>
      <h4 className="text-base font-bold text-white mt-3 group-hover/cast:text-primary transition-colors">
        {person.name}
      </h4>
      <h5 className="text-sm text-slate-400">
        {person.character ? `飾 ${person.character}` : ""}
      </h5>
    </Link>
  );
});

export default CastCard;
