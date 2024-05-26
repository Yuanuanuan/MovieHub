import { ReactNode, useRef } from "react";
import LeftButton from "@/components/LeftButton";
import RightButton from "@/components/RightButton";
import useSlide from "@/hooks/useSlide";

const Slide = ({ children }: { children: ReactNode }) => {
  const slideRef = useRef<HTMLDivElement>(null);
  const {
    leftBtnVariable,
    rightBtnVariable,
    handleClickLeft,
    handleClickRight,
  } = useSlide(slideRef);

  return (
    <>
      <section className="relative no-scrollbar">
        {leftBtnVariable && <LeftButton handleClickLeft={handleClickLeft} />}
        <div
          ref={slideRef}
          className="px-4 py-4 grid grid-flow-col gap-3 overflow-scroll no-scrollbar"
        >
          {children}
        </div>
        {rightBtnVariable && (
          <RightButton handleClickRight={handleClickRight} />
        )}
      </section>
    </>
  );
};

export default Slide;
