import rightArrow from "/rightArrow.svg";

interface RightButtonProps {
  handleClickRight: () => void;
}

export default function RightButton(props: RightButtonProps) {
  return (
    <button
      className="absolute w-14 h-full bg-[#14141490] border-none cursor-pointer z-40 top-1/2 right-0 -translate-y-1/2 backdrop-blur-sm"
      onClick={props.handleClickRight}
    >
      <img src={rightArrow} alt="right arrow" />
    </button>
  );
}
