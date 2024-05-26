import CastCard from "@/components/CastCard";
import { MovieCredits } from "@/utils/module";
import Slide from "@/components/Slide";

function CastSlide(props: MovieCredits) {
  return (
    <div>
      <h3 className="text-4xl ml-6 mb-6">主要演員</h3>
      <Slide>
        {props.cast.map((person) => {
          return <CastCard key={person.id} person={person} />;
        })}
      </Slide>
    </div>
  );
}

export default CastSlide;
