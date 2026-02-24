"use client"

import { useState } from "react"
import { User, Mail, Phone, MapPin, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export function ComingSoonForm() {
  const [submitted, setSubmitted] = useState(false)
  const [fading, setFading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbxcdRa6jRkA6bmcFL6YlLi9GJvOtLNZ3lxC6P_nIQOoD1uxgNSeO8NC-wPmXdy9zIHz/exec", {
        method: "POST",
        body: new URLSearchParams({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          location: formData.city,
        }),
      })

      toast.success("Thank you for signing up!")
      setFading(true)
      setTimeout(() => {
        setSubmitted(true)
        setFading(false)
        setLoading(false)
      }, 300)
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function resetForm() {
    setFading(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        city: "",
      })
      setFading(false)
    }, 300)
  }

  if (submitted) {
    return (
      <div
        className={`w-full max-w-md bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20 text-center space-y-5 md:space-y-6 transition-opacity duration-300 fade-in-up ${fading ? "opacity-0" : "opacity-100"}`}
      >
        <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-2">
          <CheckCircle className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <h3 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 tracking-tight">
          With Love & Gratitude
        </h3>
        <p className="text-sm font-semibold text-amber-700 tracking-wide uppercase">
          Your place in our kitchen is reserved
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Thank you for believing in us. Your name has been written on our kitchen wall — the sacred place where every order begins.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          We're perfecting each batch with the same care Maa put into hers. Soon, a jar of warmth, tradition, and homemade love will find its way to your table.
        </p>
        <button
          onClick={resetForm}
          className="mt-4 text-xs font-medium text-mustard-dark hover:text-mustard-deep transition-colors border-b border-transparent hover:border-mustard-dark pb-1"
        >
          Return to Form
        </button>
      </div>
    )
  }

  return (
    <div
      className={`w-full max-w-md bg-white/95 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20 transition-opacity duration-300 fade-in-up delay-200 ${fading ? "opacity-0" : "opacity-100"}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 ml-1">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <User className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-mustard-dark/30 focus:border-mustard-dark transition-all placeholder:text-gray-400"
              placeholder="Your Full Name"
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 ml-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-mustard-dark/30 focus:border-mustard-dark transition-all placeholder:text-gray-400"
                placeholder="your@email.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 ml-1">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-mustard-dark/30 focus:border-mustard-dark transition-all placeholder:text-gray-400"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>

        {/* Delivery City */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 ml-1">
            City / Delivery Area
          </label>
          <div className="relative">
            <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none text-gray-400">
              <MapPin className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <textarea
              rows={2}
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-mustard-dark/30 focus:border-mustard-dark transition-all placeholder:text-gray-400 resize-none"
              placeholder="Your city or area"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-mustard-dark hover:bg-mustard-deep text-white py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
        >
          {loading ? "Signing You Up..." : "Notify Me When Ready"}
        </button>
      </form>
    </div>
  )
}
