interface RightButtonProps {
  handleClickRight: () => void;
}

export default function RightButton(props: Readonly<RightButtonProps>) {
  return (
    <button
      type="button"
      aria-label="向右捲動"
      className="absolute w-16 h-full border-none cursor-pointer z-40 top-0 right-0 flex items-center justify-end bg-gradient-to-l from-black to-transparent"
      onClick={props.handleClickRight}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-3 text-slate-300 hover:text-white transition-colors"
      >
        <path d="M9 4l8 8-8 8" />
      </svg>
    </button>
  );
}
