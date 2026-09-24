import { useState } from "react";
import popcornIcon from "/popcorn.svg";

interface ImageWithSkeletonProps {
  src: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: "lazy" | "eager";
}

/** 圖片包裝元件：載入中顯示 shimmer skeleton，載入失敗或沒有網址時顯示預設圖 */
function ImageWithSkeleton({
  src,
  alt,
  className = "",
  imgClassName = "w-full h-full object-cover",
  loading = "lazy",
}: ImageWithSkeletonProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showFallback = !src || failed;

  return (
    <div className={`relative overflow-hidden bg-[#1c1c1f] ${className}`}>
      {!showFallback && !loaded && (
        <div className="absolute inset-0 animate-shimmer" />
      )}
      {showFallback ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
          <img
            src={popcornIcon}
            alt=""
            aria-hidden="true"
            className="w-10 h-10 opacity-40"
          />
          <span className="text-xs">海報未提供</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`${imgClassName} transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}

export default ImageWithSkeleton;
