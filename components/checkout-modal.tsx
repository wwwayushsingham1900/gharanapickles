"use client";

import { useState } from "react";
import { X, CheckCircle, CreditCard, ChevronLeft } from "lucide-react";
import { useCart } from "@/lib/cart-context";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep("processing");
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const shippingDetails = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      pin: formData.get("pin") as string,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          shippingDetails,
        }),
      });

      if (!response.ok) {
        throw new Error("Checkout failed. Please try again.");
      }

      const result = await response.json();
      if (result.success) {
        clearCart();
        setStep("success");
      } else {
        throw new Error(result.error || "Unknown error during checkout.");
      }
    } catch (error: any) {
      setErrorMsg(error.message);
      setStep("form");
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("form");
      setErrorMsg(null);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-charcoal-deep/70 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-lg bg-base p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-charcoal-light hover:text-earth transition-colors p-2"
        >
          <X className="h-6 w-6" />
        </button>

        {step === "success" ? (
          <div className="text-center space-y-4 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-green-50/80 border border-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-2xl font-medium tracking-tight text-brown-dark">
              Order Confirmed!
            </h3>
            <p className="text-sm font-semibold text-mustard-dark tracking-wide uppercase">
              Thank you for your purchase
            </p>
            <p className="text-sm font-light text-brown-light leading-relaxed px-4">
              Your order has been recorded securely. We will contact you soon with tracking details. The flavor of home is on its way.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 w-full bg-chilli-dark text-white py-3.5 rounded-xl text-sm font-medium tracking-wide hover:bg-chilli transition-all duration-300 shadow-lg shadow-chilli-dark/20"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h3 className="font-serif text-2xl font-medium tracking-tight text-charcoal-deep mb-2">
                Checkout securely
              </h3>
              <p className="text-sm font-light text-charcoal-light flex items-center justify-center gap-2">
                Total to pay: <span className="font-sans font-semibold text-earth">₹{cartTotal}</span>
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal-dark mb-1.5 ml-1">Name</label>
                  <input required name="name" className="w-full bg-white border border-charcoal/10 text-charcoal-dark text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-earth/30 transition-all shadow-sm" placeholder="Full Name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-dark mb-1.5 ml-1">Phone</label>
                  <input required name="phone" type="tel" className="w-full bg-white border border-charcoal/10 text-charcoal-dark text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-earth/30 transition-all shadow-sm" placeholder="10-digit number" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-charcoal-dark mb-1.5 ml-1">Email</label>
                <input required name="email" type="email" className="w-full bg-white border border-charcoal/10 text-charcoal-dark text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-earth/30 transition-all shadow-sm" placeholder="your@email.com" />
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal-dark mb-1.5 ml-1">Complete Address</label>
                <textarea required name="address" rows={2} className="w-full bg-white border border-charcoal/10 text-charcoal-dark text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-earth/30 transition-all shadow-sm resize-none" placeholder="House/Flat No, Street, Landmark, City" />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-charcoal-dark mb-1.5 ml-1">PIN Code</label>
                <input required name="pin" type="text" className="w-full bg-white border border-charcoal/10 text-charcoal-dark text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-earth/30 transition-all shadow-sm" placeholder="6-digit PIN" />
              </div>

              <button
                type="submit"
                disabled={step === "processing"}
                className="w-full mt-4 bg-mustard-dark text-white py-4 rounded-xl text-sm font-medium tracking-wide hover:bg-mustard transition-all duration-300 shadow-lg shadow-mustard-dark/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {step === "processing" ? "Processing..." : (
                  <>
                    <CreditCard className="w-4 h-4" /> Wait & Pay Securely
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
