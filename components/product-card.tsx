"use client"

import { useState, useCallback } from "react"
import { ImageGallery } from "@/components/image-gallery"
import { SizeSelector } from "@/components/size-selector"
import { PreorderModal } from "@/components/preorder-modal"
import type { Size } from "@/components/size-selector"

export function ProductCard() {
  const [selectedSize, setSelectedSize] = useState<Size>("1kg")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSizeChange = useCallback((size: Size) => {
    setSelectedSize(size)
  }, [])

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  return (
    <>
      <div className="w-full max-w-[720px] bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/20 fade-in-up delay-200">
        <div className="flex flex-col md:flex-row gap-8">
          <ImageGallery />
          <SizeSelector
            selectedSize={selectedSize}
            onSizeChange={handleSizeChange}
            onOrderClick={handleOpenModal}
          />
        </div>
      </div>

      <PreorderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedSize={selectedSize}
        onSizeChange={handleSizeChange}
      />
    </>
  )
}
