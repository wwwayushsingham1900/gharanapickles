"use client";

import { X, Save, MapPin, Calendar, CreditCard, ChevronDown } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface OrderDetailsModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS = ["pending", "shipped", "delivered", "cancelled"];

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  const [status, setStatus] = useState(order?.status || "pending");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !order) return null;

  const handleUpdateStatus = async () => {
    try {
      setIsUpdating(true);
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, { status });
      onClose();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal-deep/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-base rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 border border-charcoal/10">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-charcoal/10 flex items-center justify-between bg-white">
          <div>
            <h2 className="font-serif text-xl font-medium text-charcoal-deep">Order Details</h2>
            <p className="text-xs font-mono text-charcoal-light mt-1">ID: {order.id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-charcoal-light hover:text-earth transition-colors rounded-full hover:bg-charcoal/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#FDFBF7]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Details */}
            <div className="bg-white p-5 rounded-2xl border border-charcoal/10 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-light flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Shipping Address
              </h3>
              <div>
                <p className="font-medium text-charcoal-deep text-sm">{order.shippingDetails?.name}</p>
                <p className="text-xs text-charcoal-light/80 mt-1">{order.shippingDetails?.address}</p>
                <p className="text-xs text-charcoal-light/80">PIN: {order.shippingDetails?.pin}</p>
                <p className="text-xs text-charcoal-light/80 mt-2 font-medium">📞 {order.shippingDetails?.phone}</p>
                <p className="text-xs text-charcoal-light/80 font-medium">✉️ {order.shippingDetails?.email}</p>
              </div>
            </div>

            {/* Order Synopsis */}
            <div className="bg-white p-5 rounded-2xl border border-charcoal/10 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-light flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Order Snapshot
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-charcoal-light">Placed On:</span>
                  <span className="font-medium text-charcoal-deep">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-charcoal-light">Total Amount:</span>
                  <span className="font-medium text-earth font-sans">₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-charcoal-light">Payment:</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-100">
                    <CreditCard className="w-3 h-3" />
                    {order.paymentStatus === 'mock_success' ? 'Verified' : order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-light mb-3 ml-1">Purchased Items</h3>
            <div className="bg-white rounded-2xl border border-charcoal/10 shadow-sm divide-y divide-charcoal/5">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex gap-4 p-4 items-center">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-charcoal/5 border border-charcoal/10 shrink-0">
                    <Image src={item.image || "/placeholder.png"} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-charcoal-deep">{item.title}</h4>
                    <p className="text-xs text-charcoal-light mt-0.5 mb-1.5">Size: {item.size}</p>
                    <span className="bg-charcoal/5 px-2 py-1 border border-charcoal/10 text-xs font-medium rounded text-charcoal-dark">
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-earth">₹{item.price * item.quantity}</p>
                    <p className="text-[10px] text-charcoal-light mt-1">₹{item.price} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-5 bg-white border-t border-charcoal/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-light">Update Status</label>
            <div className="relative">
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="appearance-none bg-charcoal/5 border border-charcoal/10 text-charcoal-dark text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-mustard/30 focus:border-mustard font-medium capitalize lg:min-w-[140px]"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-charcoal-light pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          <button 
            onClick={handleUpdateStatus}
            disabled={isUpdating || status === order.status}
            className="bg-earth text-white px-6 py-2.5 rounded-xl text-sm font-medium tracking-wide hover:bg-earth/90 transition-all flex items-center gap-2 shadow-md shadow-earth/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Saving..." : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
