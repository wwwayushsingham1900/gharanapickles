"use client"

import { ArrowRight, Box } from "lucide-react"
import { useCallback } from "react"

export type Size = "250g" | "500g" | "1kg"

const PRICING: Record<Size, number> = {
  "250g": 215,
  "500g": 410,
  "1kg": 800,
}

const SIZES: { label: Size; index: number }[] = [
  { label: "250g", index: 0 },
  { label: "500g", index: 1 },
  { label: "1kg", index: 2 },
]

const BG_POSITIONS = ["left-[1%]", "left-[34%]", "left-[67%]"]

interface SizeSelectorProps {
  selectedSize: Size
  onSizeChange: (size: Size) => void
  onOrderClick: () => void
}

export function SizeSelector({
  selectedSize,
  onSizeChange,
  onOrderClick,
}: SizeSelectorProps) {
  const selectedIndex = SIZES.findIndex((s) => s.label === selectedSize)
  const price = PRICING[selectedSize]

  const handleOrderClick = useCallback(() => {
    // Track event in Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "order_now_clicked", {
        size: selectedSize,
        price: price,
        timestamp: new Date().toISOString(),
      })
    }
    onOrderClick()
  }, [selectedSize, price, onOrderClick])

  return (
    <div className="w-full md:w-[55%] flex flex-col justify-center space-y-8">
      <div className="space-y-2 text-center md:text-left">
        <div className="inline-flex items-center gap-1.5 text-earth text-xs font-medium tracking-wide uppercase mb-1">
          <Box className="h-3.5 w-3.5" />
          Signature Collection
        </div>
        <h2 className="font-serif text-3xl font-medium tracking-tight text-charcoal-deep">
          Pre-Order Your Jar
        </h2>
        <p className="text-sm font-light text-charcoal-light leading-relaxed">
          Select your preferred size to secure your batch.
        </p>
      </div>

      <div className="space-y-8">
        {/* Size Toggle */}
        <div className="flex bg-charcoal/5 p-1 rounded-2xl relative select-none">
          <div
            className={`absolute top-1 bottom-1 w-[32%] bg-mustard-dark rounded-xl shadow-sm border border-mustard/20 transition-all duration-300 ease-out z-0 ${BG_POSITIONS[selectedIndex]}`}
          />
          {SIZES.map((size) => (
            <button
              key={size.label}
              onClick={() => onSizeChange(size.label)}
              className={`relative z-10 w-1/3 py-3 text-sm font-medium transition-colors ${
                selectedSize === size.label ? "text-white" : "text-charcoal"
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>

        {/* Price Display */}
        <div className="flex items-end justify-center md:justify-start gap-1.5 h-12">
          <span className="text-sm font-medium text-charcoal-light mb-1 border-b border-charcoal/20 pb-0.5">
            Total:
          </span>
          <div
            key={price}
            className="text-4xl md:text-5xl font-sans font-medium text-earth tracking-tight animate-in fade-in slide-in-from-bottom-1 duration-200"
          >
            {`₹${price}`}
          </div>
        </div>

        {/* Order Button */}
        <button
          onClick={handleOrderClick}
          className="w-full bg-chilli-dark text-white py-4 rounded-2xl text-sm font-medium tracking-wide hover:bg-chilli hover:shadow-[0_8px_30px_rgba(153,27,27,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          Order Now
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export { PRICING }
