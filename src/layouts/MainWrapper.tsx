import SearchBar from "@/layouts/SearchBar";
import LeftButton from "@/components/LeftButton";
import RightButton from "@/components/RightButton";
import star from "/star.svg";
import popcorn from "/popcorn.svg";
import newIcon from "/newIcon.svg";
import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { getNowPlayingMovieList, getTopMovieList } from "@/api/service";
import MainMovieCard from "@/components/MainMovieCard";

type HeaderType = "newMovie" | "top10" | "5Stars";

const MainWrapper = () => {
  const [type, setType] = useState<HeaderType>("newMovie");
  const [movieList, setMovieList] = useState<Record<string, string>[]>([]);
  const [scrollInfo, setScrollInfo] = useState({
    scrollLeft: 0,
    totalWidth: Infinity,
    clientWidth: 0,
  });
  const slideRef = useRef<HTMLDivElement>(null);

  /** 點擊左邊箭頭時的執行函式 */
  function handleClickLeft() {
    if (slideRef.current) {
      slideRef.current.scrollBy({
        left: -1000,
        behavior: "smooth",
      });
    }
  }

  /** 點擊右邊箭頭時的執行函式 */
  function handleClickRight() {
    if (slideRef.current) {
      slideRef.current.scrollBy({
        left: 1000,
        behavior: "smooth",
      });
    }
  }

  /** 處理左右箭頭是否顯示 */
  useEffect(() => {
    const slideRefCurrent = slideRef.current;

    const handleScroll = () => {
      if (slideRefCurrent) {
        setScrollInfo((prev) => ({
          ...prev,
          scrollLeft: slideRefCurrent.scrollLeft,
          totalWidth: slideRefCurrent.scrollWidth,
          clientWidth: slideRefCurrent.clientWidth,
        }));
      }
    };

    if (slideRefCurrent) {
      slideRefCurrent.addEventListener("scroll", handleScroll);

      return () => {
        slideRefCurrent.removeEventListener("scroll", handleScroll);
      };
    }
  }, [scrollInfo.clientWidth, scrollInfo.scrollLeft, scrollInfo.totalWidth]);

  /** 獲取最新電影清單 */
  async function fetchNewMovies() {
    const res = await getNowPlayingMovieList();
    console.log(res);
    if (res.length) {
      setMovieList(res);
    }
  }

  /** 獲取 Top 10 電影清單 */
  async function fetchTop10Movies() {
    const res = await getTopMovieList();
    if (res.length) {
      setMovieList(res);
    }
  }

  /** 根據不同標籤抓不同資料 */
  useEffect(() => {
    if (type === "newMovie") {
      fetchNewMovies();
    } else if (type === "top10") {
      fetchTop10Movies();
    } else if (type === "5Stars") {
      console.log("5Stars");
    }

    slideRef.current?.scrollBy({
      left: -1000000,
      behavior: "smooth",
    });
  }, [type]);

  return (
    <main className="w-full">
      <Header type={type} setType={setType} />
      <section className="relative no-scrollbar">
        {scrollInfo.scrollLeft ? (
          <LeftButton handleClickLeft={handleClickLeft} />
        ) : null}
        <div
          ref={slideRef}
          className="p-5 grid grid-rows-2 grid-flow-col gap-3 overflow-y-scroll no-scrollbar min-h-hit"
        >
          {movieList.map((movie) => {
            return <MainMovieCard key={movie.id} movie={movie} />;
          })}
        </div>
        {scrollInfo.scrollLeft + scrollInfo.clientWidth <
          scrollInfo.totalWidth && (
          <RightButton handleClickRight={handleClickRight} />
        )}
      </section>
      <hr className="h-1 m-10 border-none bg-[#666666]" />
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
    <header className="py-4 px-14 flex justify-between items-center">
      <div className="flex gap-6">
        <button
          className={`py-1 px-5 rounded-3xl border-none text-2xl cursor-pointer flex justify-center items-center ${
            type === "newMovie" ? "bg-white text-black" : "bg-black text-white"
          }`}
          onClick={() => handleChangeType("newMovie")}
        >
          <img src={newIcon} className="w-8 h-8 mr-2" alt="new icon" />
          <h3>最新電影</h3>
        </button>
        <button
          className={`py-1 px-5 rounded-3xl border-none text-2xl cursor-pointer flex justify-center items-center ${
            type === "top10" ? "bg-white text-black" : "bg-black text-white"
          }`}
          onClick={() => handleChangeType("top10")}
        >
          <img src={popcorn} className="w-8 h-8 mr-2" alt="popcorn icon" />
          <h3>Top10</h3>
        </button>
        <button
          className={`py-1 px-5 rounded-3xl border-none text-2xl cursor-pointer flex justify-center items-center ${
            type === "5Stars" ? "bg-white text-black" : "bg-black text-white"
          }`}
          onClick={() => handleChangeType("5Stars")}
        >
          <img src={star} className="w-8 h-8 mr-2" alt="star icon" />
          <h6>5星好評</h6>
        </button>
      </div>
      <SearchBar />
    </header>
  );
}

export default MainWrapper;
