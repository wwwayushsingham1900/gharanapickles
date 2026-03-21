"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useCart } from "@/lib/cart-context"
import { ShoppingBag } from "lucide-react"
import { CartDrawer } from "./cart-drawer"
import { CheckoutModal } from "./checkout-modal"

export function Navbar() {
  const pathname = usePathname()
  const { items, isCartOpen, setIsCartOpen } = useCart()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <>
    <nav className="fixed top-0 w-full z-50 bg-base/90 backdrop-blur-md border-b border-mustard-dark/10 transition-all duration-300">
      <div className="w-full px-6 md:px-12 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center transition-transform hover:scale-200 cursor-pointer">
          <Image
            src="/logo.png"
            alt="Logo"
            width={500}
            height={500}
            className="w-14 h-14 md:w-20 md:h-20 object-contain"
          />
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 md:gap-12 text-xs md:text-sm font-medium tracking-wide">
          <Link
            href="/"
            className={cn(
              "text-brown-light hover:text-chilli transition-colors pb-1 border-b-2",
              pathname === "/"
                ? "text-chilli border-chilli"
                : "border-transparent hover:border-chilli"
            )}
          >
            Home
          </Link>
          <Link
            href="/store"
            className={cn(
              "text-brown-light hover:text-chilli transition-colors pb-1 border-b-2",
              pathname === "/store" || pathname === "/coming-soon"
                ? "text-chilli border-chilli"
                : "border-transparent hover:border-chilli"
            )}
          >
            Order Now
          </Link>
          <button 
            className="relative p-2 text-brown-dark hover:text-chilli transition-colors"
            onClick={() => setIsCartOpen(!isCartOpen)}
          >
            <ShoppingBag className="w-5 h-5" />
            {mounted && itemCount > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-chilli text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
    <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />
    <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </>
  )
}
