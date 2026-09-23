interface LeftButtonProps {
  handleClickLeft: () => void;
}

export default function LeftButton(props: LeftButtonProps) {
  return (
    <button
      type="button"
      aria-label="向左捲動"
      className="absolute w-16 h-full border-none cursor-pointer z-40 top-0 left-0 flex items-center bg-gradient-to-r from-black to-transparent"
      onClick={props.handleClickLeft}
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
        className="ml-3 text-slate-300 hover:text-white transition-colors"
      >
        <path d="M15 4l-8 8 8 8" />
      </svg>
    </button>
  );
}
