"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useCart } from "@/lib/cart-context"
import { useSession } from "next-auth/react"
import { CartDrawer } from "./cart-drawer"
import { CheckoutModal } from "./checkout-modal"

export function Navbar() {
  const pathname = usePathname()
  const { items, isCartOpen, setIsCartOpen } = useCart()
  const { data: session } = useSession()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl shadow-[0_40px_60px_-15px_rgba(27,28,26,0.04)] rounded-full mt-6 mx-auto max-w-4xl px-8 py-3 transition-all duration-500 ease-in-out hover:scale-102">
        {/* Logo */}
        <Link href="/" className="flex items-center transition-transform hover:scale-105 cursor-pointer">
          <Image
            src="/logo.png"
            alt="Logo"
            width={500}
            height={500}
            className="w-10 h-10 object-contain"
          />
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 font-serif tracking-tight text-stone-900 dark:text-stone-100">
          <Link
            href="/"
            className={cn(
               "font-semibold hover:scale-105 transition-all duration-500 ease-in-out",
               pathname === "/"
                 ? "text-red-800 dark:text-red-400 border-b-2 border-red-800"
                 : "text-stone-600 dark:text-stone-400 hover:text-red-800"
            )}
          >
            Home
          </Link>
          <Link
            href="/store"
            className={cn(
              "font-semibold hover:scale-105 transition-all duration-500 ease-in-out",
              pathname === "/store" || pathname === "/coming-soon"
                ? "text-red-800 dark:text-red-400 border-b-2 border-red-800"
                : "text-stone-600 dark:text-stone-400 hover:text-red-800"
            )}
          >
            Order Now
          </Link>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-6">
          <button
            className="relative hover:scale-105 transition-all duration-500 ease-in-out cursor-pointer text-stone-600 hover:text-red-800"
            onClick={() => setIsCartOpen(!isCartOpen)}
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            {mounted && itemCount > 0 && (
              <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-800 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          
          {session ? (
            <Link href="/profile" className="hover:scale-105 transition-all duration-500 ease-in-out text-stone-600 hover:text-red-800 flex items-center">
              {session.user?.image ? (
                <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full border border-stone-200" />
              ) : (
                <span className="material-symbols-outlined">account_circle</span>
              )}
            </Link>
          ) : (
            <Link href="/login" className="hover:scale-105 transition-all duration-500 ease-in-out text-stone-600 hover:text-red-800 flex items-center">
              <span className="material-symbols-outlined">person</span>
            </Link>
          )}
        </div>
      </nav>
      <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </>
  )
}
