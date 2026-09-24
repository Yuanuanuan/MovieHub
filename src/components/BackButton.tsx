import { useNavigate } from "react-router-dom";

function BackButton({ className = "" }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className={`flex items-center gap-1.5 py-2 pl-2.5 pr-4 rounded-full bg-black/55 backdrop-blur-sm text-white text-sm font-bold ${className}`}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M15 4l-8 8 8 8 1.4-1.4L9.8 12l6.6-6.6z" />
      </svg>
      返回
    </button>
  );
}

export default BackButton;
