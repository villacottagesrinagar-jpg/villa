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
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-6 text-white/50 hover:text-white text-[0.6rem] tracking-[0.25em] uppercase transition-colors"
      >
        Close
      </button>

      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[0.6rem] tracking-[0.25em] uppercase text-white/35">
        {index + 1} / {photos.length}
      </div>

      {/* Prev */}
      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 md:left-8 text-white/40 hover:text-white transition-colors p-4"
          aria-label="Previous"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current stroke-[1.5]">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Image */}
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

      {/* Next */}
      {index < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 md:right-8 text-white/40 hover:text-white transition-colors p-4"
          aria-label="Next"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current stroke-[1.5]">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
