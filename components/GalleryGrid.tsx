"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "./Lightbox";

export function GalleryGrid({ photos }: { photos: string[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {photos.map((src, i) => (
          <div
            key={src}
            className={`relative overflow-hidden cursor-pointer ${i === 0 ? "col-span-2 md:row-span-2 aspect-square md:aspect-auto" : "aspect-[4/5]"}`}
            onClick={() => setLightboxIndex(i)}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
        ))}
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
