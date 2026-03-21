"use client";

import { X, ShoppingBag, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import Image from "next/image";

interface CartDrawerProps {
  onCheckout: () => void;
}

export function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-charcoal-deep/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-base shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-charcoal/10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-mustard-dark" />
            <h2 className="font-serif text-xl font-medium text-charcoal-deep">Your Cart</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-charcoal/5 rounded-full transition-colors text-charcoal-light"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-charcoal-light/60 space-y-4">
              <ShoppingBag className="w-12 h-12" />
              <p>Your cart is empty.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-earth hover:text-mustard-dark transition-colors font-medium border-b border-current"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center bg-white p-3 rounded-2xl shadow-sm border border-charcoal/5">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-charcoal/5 flex-shrink-0">
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-charcoal-deep">{item.title}</h3>
                  <p className="text-xs text-charcoal-light mt-0.5 mb-2">Size: {item.size}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-charcoal/5 rounded-lg px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-charcoal-light hover:text-earth transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                         onClick={() => updateQuantity(item.id, item.quantity + 1)}
                         className="text-charcoal-light hover:text-earth transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-earth">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-charcoal/10 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-charcoal-light">Subtotal</span>
              <span className="text-xl font-sans font-semibold text-charcoal-deep">₹{cartTotal}</span>
            </div>
            <p className="text-xs text-charcoal-light/70 mb-6 font-light">
              Shipping & taxes calculated at checkout.
            </p>
            <button 
              onClick={() => {
                setIsCartOpen(false);
                onCheckout();
              }}
              className="w-full bg-mustard-dark text-white py-4 rounded-xl text-sm font-medium tracking-wide hover:bg-mustard hover:shadow-[0_8px_30px_rgba(202,138,4,0.3)] transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 shadow-lg"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
