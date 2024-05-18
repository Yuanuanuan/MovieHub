import video from "/video.svg";
import like from "/like.svg";

interface MovieCardProps {
  src: string;
  title: string;
  release_date: string;
}

const MovieCard = (props: MovieCardProps) => {
  return (
    <section className="w-60 h-[348] rounded-xl border-2 border-[#141414]">
      <div className="w-full h-[260]">
        <img
          className="w-full h-full object-cover rounded-t-xl"
          src={props.src}
          alt="movie poster"
        />
      </div>
      <div className="w-full h-[88] rounded-b-xl bg-white relative z-10 flex flex-col justify-around before:w-full before:h-6 before:content-none before:absolute before:bg-white before:top-0 before:left-0 before:-translate-y-1/2 before:rounded-xl before:-z-10">
        <h3 className="pl-2 text-lg font-semibold">{props.title}</h3>
        <h4 className="mt-1 pl-2 font-semibold">
          <span className="font-normal text-[#999999]">上映日期 : </span>
          {props.release_date}
        </h4>
        <div className="pr-2 self-end">
          <img className="px-1 cursor-pointer" src={video} alt="video icon" />
          <img className="px-1 cursor-pointer" src={like} alt="like icon" />
        </div>
      </div>
    </section>
  );
};

export default MovieCard;