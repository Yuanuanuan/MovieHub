import { useLoaderData } from "react-router-dom";
import starIcon from "/star.svg";
import CastSlide from "@/components/CastSlide";
import { MovieInfoRes, MovieInfo } from "@/utils/module";

function MovieDetails() {
  const res = useLoaderData() as MovieInfoRes;
  const info = res.data;

  return (
    <main className="w-full h-full text-white">
      <div className="w-full h-[70vh] flex">
        <DetailsLeftSide info={info} />
        <DetailsRightSide info={info} />
      </div>
      <hr className="h-[5px] mx-8 my-12 rounded-xl bg-[#999999] border-none" />
      <CastSlide cast={info.credits.cast} />
    </main>
  );
}

function DetailsLeftSide({ info }: { info: MovieInfo }) {
  function getRating(rate: number) {
    return rate.toFixed(2);
  }
  return (
    <div className="w-[40%] h-full flex flex-col px-6  overflow-hidden">
      <h1 className="text-[48px] mb-4">{info.title}</h1>
      <h2 className="text-lg my-2">
        上映日期 :
        <span className="text-slate-400 ml-4">{info.release_date}</span>
      </h2>
      <h3 className="flex items-center mb-6">
        <img
          width={24}
          height={24}
          src={starIcon}
          className="mr-2"
          alt="star icon"
        />
        {getRating(info.vote_average)} / 10
      </h3>
      <div className="details-scroll overflow-y-scroll">
        <p className="text-xl leading-9">
          {info.overview || "對不起!沒有相關的電影描述..."}
        </p>
      </div>
    </div>
  );
}

function DetailsRightSide({ info }: { info: MovieInfo }) {
  const videoUrl =
    import.meta.env.VITE_YOUTUBE_URL + info.videos.results[0]?.key;
  return (
    <div className="flex-1 flex justify-center">
      {info.videos.results.length ? (
        <iframe
          src={videoUrl}
          className="w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="w-[60%]">
          <img
            src={import.meta.env.VITE_IMAGE_URL + info.poster_path}
            alt="movie poster"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}

export default MovieDetails;
