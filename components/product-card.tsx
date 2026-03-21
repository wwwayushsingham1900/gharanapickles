"use client"

import { useState, useCallback } from "react"
import { ImageGallery } from "@/components/image-gallery"
import { SizeSelector } from "@/components/size-selector"
import type { Size } from "@/components/size-selector"
import { PRICING } from "@/components/size-selector"
import { useCart } from "@/lib/cart-context"

export function ProductCard() {
  const [selectedSize, setSelectedSize] = useState<Size>("1kg")
  const { addToCart } = useCart()

  const handleSizeChange = useCallback((size: Size) => {
    setSelectedSize(size)
  }, [])

  const handleAddToCart = useCallback(() => {
    addToCart({
      id: `bharua-lal-mirch-${selectedSize}`,
      title: "Bharua Lal Mirchi Achaar",
      size: selectedSize,
      price: PRICING[selectedSize],
      image: "/bharua_lal_mirch_ingredients_3.png"
    })
  }, [selectedSize, addToCart])

  return (
    <>
      <div className="w-full max-w-[720px] bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/20 fade-in-up delay-200">
        <div className="flex flex-col md:flex-row gap-8">
          <ImageGallery />
          <SizeSelector
            selectedSize={selectedSize}
            onSizeChange={handleSizeChange}
            onOrderClick={handleAddToCart}
          />
        </div>
      </div>
    </>
  )
}
