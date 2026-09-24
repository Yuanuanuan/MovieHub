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
      className="group/cast w-32 sm:w-36 md:w-40 h-fit flex flex-col items-center text-center"
    >
      <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg outline outline-2 outline-transparent outline-offset-4 transition-all duration-300 [@media(hover:hover)]:group-hover/cast:outline-primary [@media(hover:hover)]:group-hover/cast:scale-105">
        <ImageWithSkeleton
          src={personImg}
          alt="演員照片"
          loading="lazy"
          className="w-full h-full"
          imgClassName="w-full h-full object-cover"
        />
      </div>
      <h4 className="text-base font-bold text-white mt-3 [@media(hover:hover)]:group-hover/cast:text-primary transition-colors">
        {person.name}
      </h4>
      <h5 className="text-sm text-slate-400">
        {person.character ? `飾 ${person.character}` : ""}
      </h5>
    </Link>
  );
});

export default CastCard;
