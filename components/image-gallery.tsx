"use client"

import { useState, useCallback } from "react"
import Image from "next/image"

const IMAGES = [
  {
    src: "/previewww2.png",
    alt: "Pickle Jar",
  },
  {
    src: "/previewww3.png",
    alt: "Spices",
  },
  {
    src: "/bharua_lal_mirch_ingredients_3.png",
    alt: "Ingredients",
  },
  {
    src: "/previewww4.png",
    alt: "Texture",
  },
]

const INITIAL_MAIN = "/previewwww1.png"

export function ImageGallery() {
  const [mainImage, setMainImage] = useState<{ src: string; alt: string }>({
    src: INITIAL_MAIN,
    alt: "Artisanal Pickle Jar",
  })
  const [thumbnails, setThumbnails] = useState(IMAGES)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleThumbnailClick = useCallback(
    (index: number) => {
      if (isTransitioning) return

      setIsTransitioning(true)

      // Store current values
      const currentMain = { ...mainImage }
      const clickedThumb = { ...thumbnails[index] }

      setTimeout(() => {
        // Swap: main becomes the thumbnail, thumbnail becomes main
        setMainImage(clickedThumb)
        setThumbnails((prev) =>
          prev.map((t, i) => (i === index ? currentMain : t))
        )
        setActiveIndex(index)
        setIsTransitioning(false)
      }, 200)
    },
    [isTransitioning, mainImage, thumbnails]
  )

  return (
    <div className="w-full md:w-[50%] flex flex-col gap-4">
      {/* Main Image */}
      <div className="aspect-square w-full rounded-2xl bg-charcoal/5 overflow-hidden border border-charcoal/10 relative group shadow-inner">
        <Image
          src={mainImage.src}
          alt={mainImage.alt}
          fill
          className={`object-cover transition-all duration-700 group-hover:scale-105 ${
            isTransitioning ? "opacity-40 scale-[0.98]" : "opacity-100 scale-100"
          }`}
          sizes="(max-width: 768px) 100vw, 320px"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 px-0.5">
        {thumbnails.map((thumb, i) => (
          <button
            key={i}
            onClick={() => handleThumbnailClick(i)}
            className={`w-[22%] aspect-square rounded-xl overflow-hidden flex-shrink-0 ring-offset-2 transition-all shadow-sm ${
              i === activeIndex
                ? "ring-2 ring-earth opacity-100"
                : "ring-1 ring-charcoal/20 opacity-70 hover:opacity-100 hover:ring-earth/50"
            }`}
          >
            <Image
              src={thumb.src}
              alt={thumb.alt}
              width={100}
              height={100}
              className="w-full h-full object-cover transition-opacity duration-200"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
