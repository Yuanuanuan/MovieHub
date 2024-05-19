import CastCard from "./CastCard";
import useSlide from "@/hooks/useSlide";
import LeftButton from "../components/LeftButton";
import RightButton from "../components/RightButton";
import { useRef } from "react";
import { MovieCredits } from "@/utils/module";

function CastSlide(props: MovieCredits) {
  const slideRef = useRef<HTMLDivElement>(null);
  const {
    leftBtnVariable,
    rightBtnVariable,
    handleClickLeft,
    handleClickRight,
  } = useSlide(slideRef);

  return (
    <div>
      <h3 className="text-4xl ml-6 mb-6">主要演員</h3>
      <section className="relative no-scrollbar">
        {leftBtnVariable && <LeftButton handleClickLeft={handleClickLeft} />}
        <div
          ref={slideRef}
          className="px-4 grid grid-flow-col gap-4 overflow-scroll no-scrollbar"
        >
          {props.cast.map((person) => {
            return <CastCard key={person.id} person={person} />;
          })}
        </div>
        {rightBtnVariable && (
          <RightButton handleClickRight={handleClickRight} />
        )}
      </section>
    </div>
  );
}

export default CastSlide;
