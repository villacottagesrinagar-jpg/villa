"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "./Lightbox";

// Repeating size pattern: large=2×2, wide=2×1, tall=1×2, normal=1×1
const SIZES = ["large", "normal", "normal", "tall", "normal", "wide", "normal", "normal"] as const;
type Size = (typeof SIZES)[number];

export function GalleryGrid({ photos }: { photos: string[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="gallery-mosaic">
        {photos.map((src, i) => {
          const size: Size = SIZES[i % SIZES.length];
          return (
            <div
              key={src}
              className={`gallery-mosaic__item gallery-mosaic__item--${size}`}
              onClick={() => setLightboxIndex(i)}
            >
              <Image
                src={src}
                alt=""
                fill
                className="gallery-mosaic__img"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            </div>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setLightboxIndex((i) => Math.min(photos.length - 1, (i ?? 0) + 1))}
        />
      )}
    </>
  );
}
