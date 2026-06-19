"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";

export function Lightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  photos: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/92 flex items-center justify-center"
      onClick={onClose}
    >
      <button onClick={onClose} className="lb__close">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.5]">
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
        Close
      </button>

      <div className="lb__counter">
        {index + 1} / {photos.length}
      </div>

      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="lb__nav lb__nav--prev"
          aria-label="Previous"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[1.5]">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <div
        className="relative w-full h-full max-w-5xl max-h-[85vh] mx-16 md:mx-24"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photos[index]}
          alt=""
          fill
          className="object-contain"
          sizes="90vw"
          priority
        />
      </div>

      {index < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="lb__nav lb__nav--next"
          aria-label="Next"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[1.5]">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
