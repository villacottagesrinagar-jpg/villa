"use client";

import { useState } from "react";
import Image from "next/image";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
import { Lightbox } from "./Lightbox";

const PHOTOS = [
  { src: "/photos/events-1.jpg", alt: "Garden party setup",  width: 1080, height: 1440 },
  { src: "/photos/events-4.jpg", alt: "Candlelit dinner",    width: 1080, height: 1440 },
  { src: "/photos/events-6.jpg", alt: "Orchard event",       width: 1440, height: 1920 },
  { src: "/photos/events-2.jpg", alt: "",                    width: 1440, height: 1920 },
  { src: "/photos/events-3.jpg", alt: "",                    width: 1440, height: 1920 },
  { src: "/photos/events-5.jpg", alt: "",                    width: 1440, height: 1920 },
  { src: "/photos/events-7.jpg", alt: "",                    width: 1440, height: 1920 },
];

export function EventsGallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="events-gallery">
        <RowsPhotoAlbum
          photos={PHOTOS}
          targetRowHeight={130}
          spacing={2}
          padding={0}
          rowConstraints={{ minPhotos: 3, maxPhotos: 4 }}
          onClick={({ index }) => setLightboxIndex(index)}
          render={{
            image: (_props, { photo, width, height }) => (
              <Image
                src={photo.src}
                alt={photo.alt ?? ""}
                width={width}
                height={height}
                className="gallery-rows__img"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            ),
          }}
        />
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={PHOTOS.map((p) => p.src)}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setLightboxIndex((i) => Math.min(PHOTOS.length - 1, (i ?? 0) + 1))}
        />
      )}
    </>
  );
}
