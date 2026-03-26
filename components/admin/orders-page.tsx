"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Package, Truck, CheckCircle, Clock, Search, Filter } from "lucide-react";
import { OrderDetailsModal } from "@/components/admin/order-details-modal";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(fetchedOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-mustard-dark" />;
      case 'shipped': return <Truck className="w-4 h-4 text-blue-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Package className="w-4 h-4 text-charcoal-light" />;
    }
  };

  return (
    <main className="p-8 md:p-12 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-charcoal-deep font-medium tracking-tight">Order Management</h1>
          <p className="text-sm text-charcoal-light mt-1">Review, manage, and update fulfillment statuses.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal-light absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search ID or Name..." 
              className="pl-9 pr-4 py-2 border border-charcoal/10 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mustard/30 w-full md:w-64"
            />
          </div>
          <button className="p-2 border border-charcoal/10 rounded-xl bg-white hover:bg-charcoal/5 text-charcoal-dark transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-charcoal/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-charcoal/5 border-b border-charcoal/10 text-xs font-semibold text-charcoal-dark uppercase tracking-wider">
                <th className="p-5 w-48">Date & Order ID</th>
                <th className="p-5">Customer Info</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-right w-32">Total Paid</th>
                <th className="p-5 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-charcoal-light animate-pulse">Loading amazing orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-charcoal-light">Waiting for the first bite! No orders yet.</td>
                </tr>
              ) : orders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => openOrderDetails(order)}
                  className="hover:bg-charcoal/5 transition-colors group cursor-pointer"
                >
                  <td className="p-5 align-middle">
                    <div className="font-medium text-sm text-charcoal-deep mb-1">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </div>
                    <div className="text-[11px] text-charcoal-light font-mono bg-charcoal/5 px-1.5 py-0.5 rounded inline-block">
                      {order.id.substring(0, 10)}...
                    </div>
                  </td>
                  <td className="p-5 align-middle">
                    <div className="font-medium text-sm text-charcoal-deep">{order.shippingDetails?.name}</div>
                    <div className="text-xs text-charcoal-light mt-0.5 truncate max-w-[200px]">
                      {order.shippingDetails?.address}, {order.shippingDetails?.pin}
                    </div>
                  </td>
                  <td className="p-5 align-middle text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize bg-charcoal/5 border border-charcoal/10">
                      {getStatusIcon(order.status)}
                      {order.status || 'pending'}
                    </div>
                  </td>
                  <td className="p-5 align-middle text-right">
                    <div className="font-sans font-semibold text-base text-earth">
                      ₹{order.totalAmount}
                    </div>
                  </td>
                  <td className="p-5 align-middle text-center">
                    <button className="text-sm font-medium text-earth hover:text-mustard-dark transition-colors px-3 py-1.5 bg-earth/5 hover:bg-earth/10 rounded-lg opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Connection */}
      <OrderDetailsModal 
        order={selectedOrder} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

    </main>
  );
}
