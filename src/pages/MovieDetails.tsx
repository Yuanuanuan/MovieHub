import { useLoaderData } from "react-router-dom";
import starIcon from "/star.svg";
import CastSlide from "@/layouts/CastSlide";
import { MovieInfoRes, IMovieDetails } from "@/utils/module";
import HeaderWithBack from "@/components/HeaderWithBack";

function MovieDetails() {
  const res = useLoaderData() as MovieInfoRes;
  const info = res.data as IMovieDetails;

  return (
    <main className="w-full h-full text-white mb-16 px-16">
      <HeaderWithBack />
      <div className="w-full h-[70vh] flex">
        <DetailsLeftSide info={info} />
        <DetailsRightSide info={info} />
      </div>
      <hr className="hr my-10" />
      <CastSlide cast={info.credits.cast} />
      <hr className="hr my-10" />
    </main>
  );
}

function DetailsLeftSide({ info }: { info: IMovieDetails }) {
  function getRating(rate: number) {
    return rate.toFixed(2);
  }

  function getRuntime() {
    const hours = Math.floor(info.runtime / 60) || 0;
    const mins = info.runtime % 60 || 0;
    return hours + "小時" + mins + "分鐘";
  }

  return (
    <div className="w-[40%] h-full flex flex-col px-6  overflow-hidden">
      <h1 className="text-[48px] mb-4">{info.title}</h1>
      <h2 className="text-lg my-2">
        上映日期 :
        <span className="text-slate-400 ml-4">{info.release_date}</span>
      </h2>
      <h4 className="text-md tracking-wider mb-2">{getRuntime()}</h4>
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

function DetailsRightSide({ info }: { info: IMovieDetails }) {
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
