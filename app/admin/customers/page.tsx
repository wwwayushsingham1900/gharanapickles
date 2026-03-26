"use client";

import { useState, useEffect } from "react";
import { Users, Mail, Search, ChevronDown, ChevronUp, Trash2, Package, ShieldCheck, ShieldOff } from "lucide-react";
import { AdminUser, getAdminUsers, getOrdersByEmail, deleteCustomer, deleteOrder, updateCustomerRole } from "@/app/admin/actions";
import { toast } from "sonner";

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<Record<string, any[]>>({});
  const [loadingOrders, setLoadingOrders] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const fetched = await getAdminUsers();
      setUsers(fetched);
    } catch { toast.error("Failed to load customers"); }
    finally { setLoading(false); }
  };

  const toggleExpand = async (email: string) => {
    if (expandedUser === email) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(email);
    if (!userOrders[email]) {
      setLoadingOrders(email);
      const orders = await getOrdersByEmail(email);
      setUserOrders(prev => ({ ...prev, [email]: orders }));
      setLoadingOrders(null);
    }
  };

  const handleDeleteCustomer = async (email: string) => {
    const result = await deleteCustomer(email);
    if (result.success) {
      toast.success("Customer deleted successfully");
      setUsers(prev => prev.filter(u => u.email !== email));
      setConfirmDelete(null);
    } else {
      toast.error(result.error || "Failed to delete customer");
    }
  };

  const handleDeleteOrder = async (orderId: string, email: string) => {
    const result = await deleteOrder(orderId);
    if (result.success) {
      toast.success("Order deleted");
      setUserOrders(prev => ({
        ...prev,
        [email]: (prev[email] || []).filter(o => o.id !== orderId)
      }));
      setConfirmDeleteOrder(null);
    } else {
      toast.error(result.error || "Failed to delete order");
    }
  };

  const handleRoleChange = async (email: string, newRole: string) => {
    const result = await updateCustomerRole(email, newRole);
    if (result.success) {
      toast.success(`Customer role updated to ${newRole}`);
      setUsers(prev => prev.map(u => u.email === email ? { ...u, role: newRole } : u));
    } else {
      toast.error("Failed to update role");
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-12 text-center text-charcoal-light">Loading customer records...</div>;

  return (
    <main className="p-8 md:p-12 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-charcoal-deep font-medium tracking-tight">Customer Management</h1>
          <p className="text-sm text-charcoal-light mt-1">View profiles, orders, and manage accounts.</p>
        </div>
        <div className="text-sm text-charcoal-light bg-white border border-charcoal/10 px-4 py-2 rounded-xl">
          Total: <span className="font-semibold text-charcoal-deep">{users.length}</span> customers
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-charcoal/10 shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-6 border-b border-charcoal/10 bg-earth/5">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-charcoal/10 bg-white focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth text-sm text-charcoal-deep"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-charcoal/5 border-b border-charcoal/10 text-charcoal-light text-xs uppercase tracking-wider font-semibold">
                <th className="p-4 pl-6 w-8"></th>
                <th className="p-4">Profile</th>
                <th className="p-4">Customer ID</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-charcoal-light text-sm">No customers found.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <>
                    {/* Main Row */}
                    <tr
                      key={user.id}
                      onClick={() => toggleExpand(user.email)}
                      className="border-b border-charcoal/5 hover:bg-charcoal/5 transition-colors cursor-pointer group"
                    >
                      <td className="p-4 pl-6">
                        {expandedUser === user.email
                          ? <ChevronUp className="w-4 h-4 text-charcoal-light" />
                          : <ChevronDown className="w-4 h-4 text-charcoal-light" />}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-charcoal/10 shrink-0 bg-charcoal/5 flex items-center justify-center">
                            {user.image
                              ? <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                              : <Users className="w-4 h-4 text-charcoal-light" />}
                          </div>
                          <div>
                            <div className="font-semibold text-charcoal-deep text-sm">{user.name}</div>
                            <div className="text-xs text-charcoal-light flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-mono text-charcoal-light bg-charcoal/5 px-2 py-1 rounded" title={user.id}>
                          {user.id.length > 20 ? user.id.substring(0, 20) + "..." : user.id}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={user.role}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => { e.stopPropagation(); handleRoleChange(user.email, e.target.value); }}
                          className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-lg border border-charcoal/10 bg-white focus:outline-none focus:ring-1 focus:ring-earth cursor-pointer"
                        >
                          <option value="customer">Customer</option>
                          <option value="blocked">Blocked</option>
                          <option value="vip">VIP</option>
                        </select>
                      </td>
                      <td className="p-4 text-sm text-charcoal-light">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                      </td>
                      <td className="p-4 text-right pr-6">
                        {confirmDelete === user.email ? (
                          <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleDeleteCustomer(user.email)} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">Confirm</button>
                            <button onClick={() => setConfirmDelete(null)} className="text-xs bg-charcoal/10 px-3 py-1.5 rounded-lg hover:bg-charcoal/20">Cancel</button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDelete(user.email); }}
                            className="text-charcoal-light hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100"
                            title="Delete customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Orders Row */}
                    {expandedUser === user.email && (
                      <tr key={`${user.id}-orders`}>
                        <td colSpan={6} className="bg-stone-50 p-0">
                          <div className="px-8 py-6 border-b border-charcoal/10">
                            <h3 className="text-sm font-semibold text-charcoal-deep mb-4 flex items-center gap-2">
                              <Package className="w-4 h-4 text-earth" /> Orders for {user.name}
                            </h3>
                            {loadingOrders === user.email ? (
                              <p className="text-xs text-charcoal-light animate-pulse">Loading orders...</p>
                            ) : (userOrders[user.email] || []).length === 0 ? (
                              <p className="text-xs text-charcoal-light bg-white rounded-xl px-4 py-3 border border-charcoal/5">No orders found for this customer.</p>
                            ) : (
                              <div className="space-y-3">
                                {(userOrders[user.email] || []).map((order: any) => (
                                  <div key={order.id} className="bg-white rounded-xl border border-charcoal/5 p-4 flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-3 mb-1">
                                        <span className="text-xs font-mono text-charcoal-light bg-charcoal/5 px-2 py-0.5 rounded">{order.id.substring(0, 12)}...</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                          order.status === 'delivered' ? 'bg-green-50 text-green-700' :
                                          order.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                                          'bg-yellow-50 text-yellow-700'
                                        }`}>{order.status || 'pending'}</span>
                                      </div>
                                      <div className="text-xs text-charcoal-light">
                                        {order.items?.length || 0} items • ₹{order.totalAmount || 0} •{' '}
                                        {order.createdAt?.seconds
                                          ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                          : 'Unknown date'}
                                      </div>
                                    </div>
                                    <div>
                                      {confirmDeleteOrder === order.id ? (
                                        <div className="flex gap-2">
                                          <button onClick={() => handleDeleteOrder(order.id, user.email)} className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700">Delete</button>
                                          <button onClick={() => setConfirmDeleteOrder(null)} className="text-xs bg-charcoal/10 px-2 py-1 rounded-lg">Cancel</button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setConfirmDeleteOrder(order.id)}
                                          className="text-charcoal-light hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                                          title="Delete order"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
