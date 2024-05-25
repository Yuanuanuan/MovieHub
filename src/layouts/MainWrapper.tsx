import LeftButton from "@/components/LeftButton";
import RightButton from "@/components/RightButton";
import fire from "/fire.svg";
import popcorn from "/popcorn.svg";
import newIcon from "/newIcon.svg";
import {
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
import {
  getNowPlayingMovieList,
  getPopularMovieList,
  getTopMovieList,
} from "@/api/movie";
import MainMovieCard from "@/components/MainMovieCard";
import useSlide from "@/hooks/useSlide";

type HeaderType = "newMovie" | "top10" | "hot";

const MainWrapper = () => {
  const [type, setType] = useState<HeaderType>("newMovie");
  const [movieList, setMovieList] = useState<Record<string, string>[]>([]);
  const [page, setPage] = useState(1);
  const slideRef = useRef<HTMLDivElement>(null);
  const {
    fetchMore,
    rightBtnVariable,
    leftBtnVariable,
    handleClickLeft,
    handleClickRight,
  } = useSlide(slideRef);

  const fetchNewMovies = async (page: number) => {
    const res = await getNowPlayingMovieList(page);
    if (res.length) {
      setMovieList((prev) => prev.concat(res));
    }
  };

  const fetchHotMovies = async (page: number) => {
    const res = await getPopularMovieList(page);
    if (res.length) {
      setMovieList((prev) => prev.concat(res));
    }
  };

  const fetchTop10Movies = async (page: number) => {
    const res = await getTopMovieList(page);
    if (res.length) {
      setMovieList((prev) => prev.concat(res));
    }
  };

  const fetchMovies = useCallback(async (page: number, type: HeaderType) => {
    if (type === "newMovie") {
      await fetchNewMovies(page);
    } else if (type === "top10") {
      await fetchTop10Movies(page);
    } else if (type === "hot") {
      await fetchHotMovies(page);
    }
  }, []);

  useEffect(() => {
    if (fetchMore) {
      setPage((prev) => prev + 1);
    }
  }, [fetchMore]);

  useEffect(() => {
    fetchMovies(page, type);
  }, [fetchMovies, page, type]);

  useEffect(() => {
    setMovieList([]);
    setPage(1); // Reset to page 1 on type change
  }, [type]);

  useEffect(() => {
    slideRef.current?.scrollBy({
      left: -1000000,
      behavior: "smooth",
    });
  }, [type]);

  return (
    <main className="w-full">
      <Header type={type} setType={setType} />
      <section className="h-[740px] relative no-scrollbar">
        {leftBtnVariable && <LeftButton handleClickLeft={handleClickLeft} />}
        <div
          ref={slideRef}
          className="p-5 grid grid-rows-2 grid-flow-col gap-3 overflow-y-scroll no-scrollbar"
        >
          {movieList.map((movie, index) => {
            return <MainMovieCard key={index} movie={movie} />;
          })}
        </div>
        {rightBtnVariable && (
          <RightButton handleClickRight={handleClickRight} />
        )}
      </section>
      <hr className="hr m-10" />
    </main>
  );
};

/** 主頁中主要部份的header(搜尋欄的部分) */
function Header({
  type,
  setType,
}: {
  type: HeaderType;
  setType: Dispatch<SetStateAction<HeaderType>>;
}) {
  function handleChangeType(type: HeaderType) {
    setType(type);
  }

  return (
    <header className="py-4 px-5 flex justify-between items-center">
      <div className="flex gap-6">
        <ToolsButton
          type={type}
          currentType="newMovie"
          icon={newIcon}
          label="最新電影"
          changeType={handleChangeType}
        />
        <ToolsButton
          type={type}
          currentType="hot"
          icon={fire}
          label="熱門電影"
          changeType={handleChangeType}
        />
        <ToolsButton
          type={type}
          currentType="top10"
          icon={popcorn}
          label="Top10"
          changeType={handleChangeType}
        />
      </div>
    </header>
  );
}

interface ToolsButtonProps {
  type: HeaderType;
  currentType: HeaderType;
  icon: string;
  label: string;
  changeType: (type: HeaderType) => void;
}

function ToolsButton(props: ToolsButtonProps) {
  return (
    <button
      className={`py-1 px-5 rounded-3xl border-none text-2xl cursor-pointer flex justify-center items-center ${
        props.type === props.currentType
          ? "bg-white text-black"
          : "bg-black text-white"
      }`}
      onClick={() => props.changeType(props.currentType)}
    >
      <img
        src={props.icon}
        className="w-8 h-8 mx-2 my-1"
        alt={`${props.icon} icon`}
      />
      <h6>{props.label}</h6>
    </button>
  );
}

export default MainWrapper;
