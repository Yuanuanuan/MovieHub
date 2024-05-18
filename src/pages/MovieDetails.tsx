import { useLoaderData } from "react-router-dom";
import starIcon from "/star.svg";
import { useNavigation } from "react-router-dom";
import { useDispatch } from "react-redux";

interface MovieInfoRes {
  data: {
    id: string;
    poster_path: string;
    overview: string;
    title: string;
    release_date: string;
    vote_average: number;
    videos: {
      results: [
        {
          key: string;
        }
      ];
    };
    reviews: {
      results: [
        {
          author_details: {
            name: string;
            username: string;
            avatar_path: string | null;
            rating: number;
          };
          content: string;
          created_at: string;
          id: string;
        }
      ];
    };
    credits: {
      cast: [
        {
          id: number;
          gender: 1 | 2;
          name: string;
          profile_path: string;
        }
      ];
    };
  };
}

function MovieDetails() {
  const res = useLoaderData() as MovieInfoRes;
  const navState = useNavigation();
  const dispatch = useDispatch();
  const info = res.data;

  console.log(navState);

  if (navState.state === "idle") {
    console.log("123");
    dispatch({ type: "ONLOAD" });
  }

  const videoUrl =
    import.meta.env.VITE_YOUTUBE_URL + info.videos.results[0]?.key;

  function getRating(rate: number) {
    return rate.toFixed(2);
  }

  return (
    <main className="w-full h-[100vh]">
      <div className="w-full h-full flex">
        <div className="w-[40%] h-[70%] px-6 text-white">
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
          <p className="text-xl leading-9">
            {info.overview || "對不起!沒有相關的電影描述..."}
          </p>
        </div>
        {info.videos.results.length ? (
          <iframe
            src={videoUrl}
            className="w-[60%] h-[70%]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-[60%] h-[70%] text-white">
            <img
              width={"60%"}
              height={"70%"}
              src={import.meta.env.VITE_IMAGE_URL + info.poster_path}
              alt="movie poster"
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>
    </main>
  );
}

export default MovieDetails;
