import HeaderWithBack from "@/components/HeaderWithBack";
import { PersonInfoRes, IPersonInfo } from "@/utils/module";
import { useLoaderData } from "react-router-dom";
import PersonInfo from "@/components/PersonIfno";
import Slide from "@/components/Slide";
import MovieCard from "@/components/MovieCard";

function PersonDetails() {
  const res = useLoaderData() as PersonInfoRes;
  const personInfo = res.data as IPersonInfo;
  console.log(personInfo);

  return (
    <main className="w-full h-full text-white mb-16 px-16 max-w-[1400px] m-auto">
      <HeaderWithBack />
      <PersonInfo personInfo={personInfo} />
      <hr className="hr my-16" />
      <h3 className="text-white text-5xl -mt-4 mb-8">出演電影</h3>
      <Slide>
        {personInfo?.movie_credits?.cast?.length
          ? personInfo.movie_credits.cast.map((movie) => {
              return <MovieCard key={movie.id} movie={movie} />;
            })
          : null}
      </Slide>
    </main>
  );
}

export default PersonDetails;
