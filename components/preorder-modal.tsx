"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Bell, X, User, Phone, ChevronDown, CheckCircle } from "lucide-react"
import type { Size } from "@/components/size-selector"
import { PRICING } from "@/components/size-selector"

interface PreorderModalProps {
  isOpen: boolean
  onClose: () => void
  selectedSize: Size
  onSizeChange: (size: Size) => void
}

const SIZE_OPTIONS: Size[] = ["250g", "500g", "1kg"]

export function PreorderModal({
  isOpen,
  onClose,
  selectedSize,
  onSizeChange,
}: PreorderModalProps) {
  const [isSuccess, setIsSuccess] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownBtnRef = useRef<HTMLButtonElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        dropdownBtnRef.current &&
        !dropdownBtnRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsDropdownOpen(false)
    } else {
      // Track modal open in Google Analytics
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "preorder_modal_opened", {
          size: selectedSize,
          timestamp: new Date().toISOString(),
        })
      }
    }
  }, [isOpen, selectedSize])

  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setLoading(true)

      try {
        const formData = new FormData(e.currentTarget)
        
        const response = await fetch("https://script.google.com/macros/s/AKfycbwHINYvJUapAPQ0mLCRdyQ9_y-7LOZOK3A5uOPF9MDRz0AHs5dcZ1AXnaRrpQdtS1Y-/exec", {
          method: "POST",
          body: new URLSearchParams({
            fullName: formData.get("fullName") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
          }),
        })

        const result = await response.json()
        
        if (result.success) {
          setIsSuccess(true)
        }
      } catch (error) {
        console.error("Submission error:", error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const handleClose = useCallback(() => {
    onClose()
    // Reset success after close animation
    setTimeout(() => setIsSuccess(false), 500)
  }, [onClose])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-500 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal-deep/70 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        className={`relative w-full max-w-[460px] bg-base p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/20 transition-transform duration-500 ${
          isOpen ? "scale-100" : "scale-95"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-charcoal-light hover:text-earth transition-colors p-2 cursor-pointer"
        >
          <X className="h-6 w-6" />
        </button>

        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="text-center space-y-4 mb-8">
              <div className="w-14 h-14 bg-mustard/10 rounded-full flex items-center justify-center mx-auto text-mustard-dark mb-2">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-2xl font-medium tracking-tight text-charcoal-deep leading-tight">
                {"We're launching soon!"}
              </h3>
              <p className="text-sm font-light text-charcoal-light leading-relaxed">
                Online services are launching very soon! To be the first to know
                when we go live and secure your pre-order, please fill out the
                form below.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-charcoal-dark mb-1.5 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-light/50">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="w-full bg-white border border-charcoal/10 text-charcoal-dark text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-earth/30 focus:border-earth/50 transition-all placeholder:text-charcoal-light/40 shadow-sm"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-charcoal-dark mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-light/50">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full bg-white border border-charcoal/10 text-charcoal-dark text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-earth/30 focus:border-earth/50 transition-all placeholder:text-charcoal-light/40 shadow-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-medium text-charcoal-dark mb-1.5 ml-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-light/50">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full bg-white border border-charcoal/10 text-charcoal-dark text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-earth/30 focus:border-earth/50 transition-all placeholder:text-charcoal-light/40 shadow-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-mustard-dark text-white py-4 rounded-xl text-sm font-medium tracking-wide hover:bg-mustard transition-all duration-300 mt-4 shadow-lg shadow-mustard-dark/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Notify Me"}
              </button>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-green-50/80 border border-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-2xl font-medium tracking-tight text-brown-dark">
              With Love & Gratitude
            </h3>
            <p className="text-sm font-semibold text-chilli tracking-wide uppercase">
              YOUR PLACE IN OUR KITCHEN IS RESERVED
            </p>
            <p className="text-sm font-light text-brown-light leading-relaxed px-4">
              Thank you for believing in us. Your name has been written on our kitchen wall, the sacred place where every order begins.
            </p>
            <p className="text-sm font-light text-brown-light leading-relaxed px-4">
              We're perfecting each batch with the same care Maa put into hers. Soon, a jar of warmth, tradition, and homemade love will find its way to your table.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 text-xs font-medium text-terracotta-dark hover:text-chilli transition-colors border-b border-transparent hover:border-chilli pb-0.5"
            >
              Return to Form
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
