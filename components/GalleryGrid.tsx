"use client";

import { useState } from "react";
import Image from "next/image";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
import { Lightbox } from "./Lightbox";

type Photo = { src: string; category: "exterior" | "interior"; width: number; height: number };
type Filter = "all" | "exterior" | "interior";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all",      label: "All" },
  { value: "exterior", label: "Exterior" },
  { value: "interior", label: "Interior" },
];

export function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = filter === "all" ? photos : photos.filter((p) => p.category === filter);

  return (
    <>
      <div className="gallery-filters">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setFilter(value); setLightboxIndex(null); }}
            className={`gallery-filter-btn ${filter === value ? "gallery-filter-btn--active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="gallery-rows">
        <RowsPhotoAlbum
          photos={filtered}
          targetRowHeight={65}
          spacing={1}
          padding={0}
          rowConstraints={{ minPhotos: 5, maxPhotos: 8 }}
          onClick={({ index }) => setLightboxIndex(index)}
          render={{
            image: (_props, { photo, width, height }) => (
              <Image
                src={photo.src}
                alt=""
                width={width}
                height={height}
                className="gallery-rows__img"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ),
          }}
        />
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={filtered.map((p) => p.src)}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setLightboxIndex((i) => Math.min(filtered.length - 1, (i ?? 0) + 1))}
        />
      )}
    </>
  );
}
