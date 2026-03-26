"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { IndianRupee, ShoppingBag, TrendingUp, Package } from "lucide-react";

export function AdminOverviewPage() {
  const [metrics, setMetrics] = useState({ revenue: 0, orders: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let revenue = 0;
      let pendingCount = 0;
      const orders = snapshot.docs.map(doc => {
        const data = doc.data();
        revenue += data.totalAmount || 0;
        if (data.status === 'pending') pendingCount++;
        return { id: doc.id, ...data };
      });
      
      setMetrics({ revenue, orders: orders.length, pending: pendingCount });
      setRecentOrders(orders.slice(0, 5)); // Just the 5 most recent
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="p-8 md:p-12 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif text-charcoal-deep font-medium tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-charcoal-light mt-1">Welcome back. Here is what is happening with your store today.</p>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-charcoal-light animate-pulse">
          Loading metrics...
        </div>
      ) : (
        <>
          {/* Key Metrics grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-charcoal/10 flex items-center gap-5">
              <div className="w-14 h-14 bg-earth/10 rounded-full flex items-center justify-center text-earth">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-light">Total Revenue</p>
                <h3 className="text-3xl font-sans font-bold text-charcoal-deep">₹{metrics.revenue.toLocaleString('en-IN')}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-charcoal/10 flex items-center gap-5">
              <div className="w-14 h-14 bg-chilli/10 rounded-full flex items-center justify-center text-chilli-dark">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-light">Total Orders</p>
                <h3 className="text-3xl font-sans font-bold text-charcoal-deep">{metrics.orders}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-charcoal/10 flex items-center gap-5">
              <div className="w-14 h-14 bg-mustard/10 rounded-full flex items-center justify-center text-mustard-dark">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-light">Pending Fulfillment</p>
                <h3 className="text-3xl font-sans font-bold text-charcoal-deep">{metrics.pending}</h3>
              </div>
            </div>
          </div>

          {/* Recent Orders Snapshot */}
          <div className="bg-white rounded-3xl shadow-sm border border-charcoal/10 overflow-hidden">
            <div className="p-6 border-b border-charcoal/10 flex items-center justify-between">
              <h3 className="font-serif text-xl font-medium text-charcoal-deep flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-earth" />
                Recent Orders
              </h3>
              <a href="/admin/orders" className="text-sm font-medium text-earth hover:text-mustard-dark transition-colors">
                View All →
              </a>
            </div>
            <div className="divide-y divide-charcoal/10">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-charcoal-light">No records found.</div>
              ) : recentOrders.map((order) => (
                <div key={order.id} className="p-5 flex items-center justify-between hover:bg-charcoal/5 transition-colors">
                  <div>
                    <div className="font-medium text-sm text-charcoal-deep mb-1">{order.shippingDetails?.name || "Unknown Customer"}</div>
                    <div className="text-xs text-charcoal-light font-mono">{order.id.substring(0, 10)}...</div>
                  </div>
                  <div className="text-right">
                    <div className="font-sans font-semibold text-lg text-earth">₹{order.totalAmount}</div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-mustard-dark mt-1">{order.status || 'pending'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
