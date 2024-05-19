import { useState, useEffect } from "react";

function useSlide(slideRef: React.RefObject<HTMLDivElement>) {
  const [scrollInfo, setScrollInfo] = useState({
    scrollLeft: 0,
    totalWidth: Infinity,
    clientWidth: 0,
  });

  const fetchMore =
    scrollInfo.scrollLeft + scrollInfo.clientWidth >=
    scrollInfo.totalWidth - 1000;
  const leftBtnVariable = !!scrollInfo.scrollLeft;
  const rightBtnVariable =
    scrollInfo.scrollLeft + scrollInfo.clientWidth < scrollInfo.totalWidth;

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

  useEffect(() => {
    console.log("slideRef change");
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
  }, [slideRef]);

  return {
    fetchMore,
    leftBtnVariable,
    rightBtnVariable,
    handleClickLeft,
    handleClickRight,
  };
}

export default useSlide;
