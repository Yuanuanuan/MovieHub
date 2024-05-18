import leftArrow from "/leftArrow.svg";

interface LeftButtonProps {
  handleClickLeft: () => void;
}

export default function LeftButton(props: LeftButtonProps) {
  return (
    <button
      className="absolute w-14 h-full bg-[#14141490] border-none cursor-pointer z-40 top-1/2 left-0 -translate-y-1/2 backdrop-blur-sm"
      onClick={props.handleClickLeft}
    >
      <img src={leftArrow} alt="left arrow" />
    </button>
  );
}
