"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "./Lightbox";

const PHOTOS = [
  "/photos/events-1.jpg",
  "/photos/events-4.jpg",
  "/photos/events-6.jpg",
  "/photos/events-2.jpg",
  "/photos/events-3.jpg",
  "/photos/events-5.jpg",
  "/photos/events-7.jpg",
];

export function EventsGallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  function open(i: number) { setLightboxIndex(i); }

  return (
    <>
      {/* Top grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => open(0)}>
          <Image src={PHOTOS[0]} alt="Garden party setup" fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="25vw" />
        </div>
        <div className="grid gap-2">
          <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => open(1)}>
            <Image src={PHOTOS[1]} alt="Candlelit dinner" fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="25vw" />
          </div>
          <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => open(2)}>
            <Image src={PHOTOS[2]} alt="Orchard event" fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="25vw" />
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
        {PHOTOS.slice(3).map((src, i) => (
          <div key={src} className="relative aspect-[4/3] overflow-hidden cursor-pointer" onClick={() => open(i + 3)}>
            <Image src={src} alt="" fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="25vw" />
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={PHOTOS}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setLightboxIndex((i) => Math.min(PHOTOS.length - 1, (i ?? 0) + 1))}
        />
      )}
    </>
  );
}
