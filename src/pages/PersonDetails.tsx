import { PersonInfoRes, IPersonInfo } from "@/utils/module";
import { useLoaderData } from "react-router-dom";
import BackButton from "@/components/BackButton";
import PersonInfo from "@/components/PersonIfno";
import Slide from "@/components/Slide";
import MovieCard from "@/components/MovieCard";
import { getPersonImage } from "@/utils/person";

function PersonDetails() {
  const res = useLoaderData() as PersonInfoRes;
  const personInfo = res.data as IPersonInfo;

  return (
    <main className="w-full h-full text-white mb-16">
      <div className="relative h-[260px] sm:h-[320px] overflow-hidden">
        <img
          src={getPersonImage(personInfo)}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover scale-110 blur-md opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <BackButton className="absolute top-4 left-4 z-10" />
      </div>

      <PersonInfo personInfo={personInfo} />

      <div className="mt-2 mb-2">
        <h3 className="text-4xl ml-4 mb-6">出演電影</h3>
        <Slide>
          {personInfo?.movie_credits?.cast?.length
            ? personInfo.movie_credits.cast.map((movie) => (
                <MovieCard key={movie.id} movie={movie} size="compact" />
              ))
            : null}
        </Slide>
      </div>
    </main>
  );
}

export default PersonDetails;
