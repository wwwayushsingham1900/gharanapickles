"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import {
  Package, LogOut, Clock, ChevronRight, Pencil, Trash2, Check, X,
  Mail, MapPin, Settings, Heart, ChevronDown,
  Bell, Lock, Eye, Plus, CheckCircle, Truck, Box, PackageCheck, ShoppingBag, Copy, Link2
} from "lucide-react"
import { getOrdersByEmail, updateUserProfile, deleteMyAccount, requestPasswordReset } from "@/app/admin/actions"
import { toast } from "sonner"

// --- Reusable Animated Components ---

function Card({ children, className = "", delay = 0, ...props }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-stone-100 rounded-xl ${className}`} />
}

function SectionTab({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
        active
          ? "text-red-900 bg-red-50 border border-red-100 shadow-sm"
          : "text-stone-400 hover:text-stone-700 hover:bg-stone-50"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

// --- Order Tracking Steps ---
const TRACKING_STEPS = [
  { key: "pending", label: "Placed", icon: ShoppingBag },
  { key: "packed", label: "Packed", icon: Box },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
]

function OrderTracker({ status }: { status: string }) {
  const statusMap: Record<string, number> = { pending: 0, packed: 1, shipped: 2, delivered: 3 }
  const currentStep = statusMap[status] ?? 0

  return (
    <div className="flex items-center gap-1 mt-4 pt-4 border-t border-stone-50">
      {TRACKING_STEPS.map((step, i) => {
        const isComplete = i <= currentStep
        const isCurrent = i === currentStep
        const Icon = step.icon
        return (
          <div key={step.key} className="flex items-center flex-1">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: isCurrent ? 1.1 : 1 }}
              className="relative flex flex-col items-center gap-1.5 flex-1"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                isCurrent
                  ? "bg-gradient-to-br from-red-700 to-red-900 shadow-md shadow-red-200"
                  : isComplete
                    ? "bg-green-50 border border-green-200"
                    : "bg-stone-50 border border-stone-100"
              }`}>
                {isComplete && !isCurrent ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? "text-white" : "text-stone-300"}`} />
                )}
              </div>
              <span className={`text-[9px] font-medium tracking-wider uppercase ${
                isCurrent ? "text-red-800" : isComplete ? "text-green-600" : "text-stone-300"
              }`}>{step.label}</span>
            </motion.div>
            {i < TRACKING_STEPS.length - 1 && (
              <div className={`h-px flex-1 mx-1 transition-all duration-500 ${
                i < currentStep ? "bg-green-200" : "bg-stone-100"
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// --- Main Page ---

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState("")
  const [activeTab, setActiveTab] = useState("orders")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (session?.user?.email) {
      setNewName(session.user.name || "")
      fetchOrders(session.user.email)
    }
  }, [session])

  const fetchOrders = async (email: string) => {
    setLoadingOrders(true)
    const fetched = await getOrdersByEmail(email)
    setOrders(fetched)
    setLoadingOrders(false)
  }

  const handleUpdateName = async () => {
    if (!session?.user?.email || !newName.trim()) return
    const result = await updateUserProfile(session.user.email, newName.trim())
    if (result.success) {
      toast.success("Name updated successfully!")
      setEditingName(false)
    } else {
      toast.error("Failed to update name")
    }
  }

  // Loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background-stitch flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-red-200 border-t-red-800 rounded-full"
        />
      </div>
    )
  }

  if (!session?.user) return null

  const user = session.user
  const name = user.name || "Customer"
  const email = user.email || ""
  const image = user.image || ""

  return (
    <div className="min-h-screen bg-background-stitch font-body">
      <Navbar />

      <main className="pt-28 pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Hero Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 mb-3">My Dashboard</h1>
          <p className="text-stone-400 text-sm sm:text-base">Manage your account, track orders, and personalize your experience.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ========== Sidebar — Profile Card ========== */}
          <div className="lg:col-span-4 space-y-6">
            <Card delay={0.1} className="p-8">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <motion.div whileHover={{ scale: 1.05 }} className="relative w-28 h-28 mb-5 group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-red-300 via-red-400 to-amber-300 rounded-full opacity-50 group-hover:opacity-80 blur-sm transition-opacity duration-500" />
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {image ? (
                      <img src={image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center text-4xl font-serif text-red-800">
                        {name.charAt(0)}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Name Edit */}
                {editingName ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mb-3 w-full">
                    <input
                      type="text" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus
                      className="flex-1 border border-stone-200 rounded-xl px-4 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800/40 transition-all"
                    />
                    <button onClick={handleUpdateName} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"><Check className="w-4 h-4" /></button>
                    <button onClick={() => { setEditingName(false); setNewName(name); }} className="p-2 bg-stone-50 text-stone-400 rounded-xl hover:bg-stone-100 transition-colors"><X className="w-4 h-4" /></button>
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-serif font-semibold text-stone-900">{name}</h2>
                    <button onClick={() => setEditingName(true)} className="p-1 text-stone-300 hover:text-red-800 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  </div>
                )}
                <p className="text-stone-400 text-sm flex items-center gap-1.5 mb-6">
                  <Mail className="w-3.5 h-3.5" /> {email}
                </p>

                {/* Stats */}
                <div className="w-full grid grid-cols-2 gap-3 mb-2">
                  <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100/50">
                    <div className="text-2xl font-bold text-red-800">{orders.length}</div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider mt-1">Orders</div>
                  </div>
                  <div className="bg-green-50/50 rounded-2xl p-4 border border-green-100/50">
                    <div className="text-2xl font-bold text-green-700">{orders.filter(o => o.status === "delivered").length}</div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider mt-1">Delivered</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Membership Badge */}
            <Card delay={0.2} className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 border border-red-100/50 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm">Gharana Family Member</h3>
                  <p className="text-[11px] text-stone-400">First access to limited seasonal batches</p>
                </div>
              </div>
            </Card>
          </div>

          {/* ========== Main Content ========== */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tabs */}
            <Card delay={0.15} className="p-3">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                <SectionTab icon={Package} label="Orders" active={activeTab === "orders"} onClick={() => setActiveTab("orders")} />
                <SectionTab icon={MapPin} label="Addresses" active={activeTab === "addresses"} onClick={() => setActiveTab("addresses")} />
                <SectionTab icon={Heart} label="Wishlist" active={activeTab === "wishlist"} onClick={() => setActiveTab("wishlist")} />
                <SectionTab icon={Settings} label="Settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
              </div>
            </Card>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {/* ===== ORDERS TAB ===== */}
              {activeTab === "orders" && (
                <motion.div key="orders" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                  <Card delay={0} className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-serif font-semibold text-stone-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center"><Package className="w-4 h-4 text-red-800" /></div>
                        My Orders
                      </h2>
                      <span className="text-xs bg-stone-50 text-stone-500 px-3 py-1.5 rounded-full border border-stone-100">
                        {orders.length} order{orders.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {loadingOrders ? (
                      <div className="space-y-4">{[1, 2, 3].map(i => <SkeletonPulse key={i} className="h-28" />)}</div>
                    ) : orders.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-100 p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center mb-4"><Clock className="w-8 h-8 text-stone-200" /></div>
                        <h3 className="text-lg font-medium text-stone-800 mb-2">No orders yet</h3>
                        <p className="text-stone-400 text-sm max-w-sm mb-6">Your first order of authentic Gharana pickles will appear here with full tracking.</p>
                        <motion.a whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} href="/store"
                          className="bg-stone-900 text-white px-6 py-3 rounded-xl hover:bg-red-800 transition-colors font-medium text-sm flex items-center gap-2 shadow-sm"
                        >Explore Collections <ChevronRight className="w-4 h-4" /></motion.a>
                      </motion.div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order: any, idx: number) => (
                          <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="group cursor-pointer bg-stone-50/50 hover:bg-stone-50 border border-stone-100 hover:border-stone-200 rounded-2xl p-5 transition-all duration-300"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs font-mono text-stone-400 bg-white px-2.5 py-1 rounded-lg border border-stone-100">{order.id.substring(0, 12)}...</span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                                  order.status === "delivered" ? "bg-green-50 text-green-700 border border-green-100" :
                                  order.status === "shipped" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                  order.status === "packed" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                                  "bg-amber-50 text-amber-700 border border-amber-100"
                                }`}>{order.status || "pending"}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-base font-semibold text-stone-900">₹{order.totalAmount}</span>
                                <motion.div animate={{ rotate: expandedOrder === order.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                  <ChevronDown className="w-4 h-4 text-stone-300" />
                                </motion.div>
                              </div>
                            </div>
                            <div className="text-xs text-stone-400">
                              {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""} •{" "}
                              {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Unknown date"}
                            </div>
                            <AnimatePresence>
                              {expandedOrder === order.id && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                                  {order.items && order.items.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
                                      {order.items.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                          <span className="text-stone-500">{item.name} × {item.quantity}</span>
                                          <span className="text-stone-700 font-medium">₹{item.price * item.quantity}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <OrderTracker status={order.status || "pending"} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* ===== ADDRESSES TAB ===== */}
              {activeTab === "addresses" && (
                <motion.div key="addresses" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                  <Card delay={0} className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-serif font-semibold text-stone-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center"><MapPin className="w-4 h-4 text-blue-600" /></div>
                        Saved Addresses
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {orders.length > 0 && orders[0]?.shippingDetails ? (
                        <motion.div whileHover={{ y: -2 }} className="bg-stone-50/50 border border-stone-100 rounded-2xl p-5 hover:border-red-200 transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Default</span>
                          </div>
                          <p className="text-sm text-stone-700 font-medium mb-1">{orders[0].shippingDetails.name}</p>
                          <p className="text-xs text-stone-400 leading-relaxed">{orders[0].shippingDetails.address}</p>
                          <p className="text-xs text-stone-400">PIN: {orders[0].shippingDetails.pin}</p>
                        </motion.div>
                      ) : null}
                      <motion.button whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}
                        className="border-2 border-dashed border-stone-100 hover:border-stone-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-stone-300 hover:text-stone-500 transition-all"
                      >
                        <Plus className="w-6 h-6" />
                        <span className="text-xs font-medium">Add Address</span>
                      </motion.button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ===== WISHLIST TAB ===== */}
              {activeTab === "wishlist" && (
                <motion.div key="wishlist" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                  <Card delay={0} className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-serif font-semibold text-stone-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center"><Heart className="w-4 h-4 text-pink-500" /></div>
                        Wishlist
                      </h2>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-100 p-12 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-pink-50/50 flex items-center justify-center mb-4"><Heart className="w-8 h-8 text-pink-200" /></div>
                      <h3 className="text-lg font-medium text-stone-700 mb-2">Your wishlist is empty</h3>
                      <p className="text-stone-400 text-sm max-w-sm mb-6">Browse our collections and add your favourite pickles for quick access.</p>
                      <motion.a whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} href="/store"
                        className="bg-stone-900 text-white px-6 py-3 rounded-xl hover:bg-red-800 transition-colors font-medium text-sm flex items-center gap-2"
                      >Browse Store <ChevronRight className="w-4 h-4" /></motion.a>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ===== SETTINGS TAB ===== */}
              {activeTab === "settings" && (
                <motion.div key="settings" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                  <Card delay={0} className="p-6 sm:p-8">
                    <div className="flex items-center gap-2.5 mb-8">
                      <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center"><Settings className="w-4 h-4 text-stone-500" /></div>
                      <h2 className="text-xl font-serif font-semibold text-stone-900">Settings</h2>
                    </div>
                    <div className="space-y-3">
                      <SettingsToggle icon={Bell} title="Order Notifications" description="Get notified about order status updates" />
                      <SettingsToggle icon={Eye} title="Profile Visibility" description="Control who can see your profile info" />
                      <PasswordResetRow email={email} />
                      <SettingsButton icon={LogOut} title="Sign Out" description="Sign out of this session" onClick={() => signOut({ callbackUrl: "/" })} />
                      <DeleteAccountRow email={email} />
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}

// --- Settings Components ---

function SettingsToggle({ icon: Icon, title, description }: any) {
  const [on, setOn] = useState(true)
  return (
    <motion.div whileHover={{ x: 2 }} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50/50 border border-stone-100 hover:border-stone-200 transition-all">
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-white border border-stone-100 flex items-center justify-center"><Icon className="w-4 h-4 text-stone-400" /></div>
        <div><div className="text-sm font-medium text-stone-700">{title}</div><div className="text-[11px] text-stone-400">{description}</div></div>
      </div>
      <button onClick={() => setOn(!on)} className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${on ? "bg-red-800" : "bg-stone-200"}`}>
        <motion.div animate={{ x: on ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        />
      </button>
    </motion.div>
  )
}

function SettingsButton({ icon: Icon, title, description, onClick, danger }: any) {
  return (
    <motion.div whileHover={{ x: 2 }} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50/50 border border-stone-100 hover:border-stone-200 transition-all">
      <div className="flex items-center gap-3.5">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${danger ? "bg-red-50 border-red-100" : "bg-white border-stone-100"}`}><Icon className={`w-4 h-4 ${danger ? "text-red-500" : "text-stone-400"}`} /></div>
        <div><div className={`text-sm font-medium ${danger ? "text-red-600" : "text-stone-700"}`}>{title}</div><div className="text-[11px] text-stone-400">{description}</div></div>
      </div>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick}
        className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${danger ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100" : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"}`}
      >{title}</motion.button>
    </motion.div>
  )
}

function PasswordResetRow({ email }: { email: string }) {
  const [loading, setLoading] = useState(false)
  const [resetLink, setResetLink] = useState("")

  const handleRequest = async () => {
    setLoading(true)
    const result = await requestPasswordReset(email)
    setLoading(false)
    if (result.success && result.resetLink) {
      setResetLink(result.resetLink)
      toast.success("Password reset link generated!")
    } else {
      toast.error(result.error || "Failed to generate reset link")
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(resetLink)
    toast.success("Link copied to clipboard!")
  }

  return (
    <motion.div whileHover={{ x: 2 }} className="p-4 rounded-2xl bg-stone-50/50 border border-stone-100 hover:border-stone-200 transition-all">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-white border border-stone-100 flex items-center justify-center"><Lock className="w-4 h-4 text-stone-400" /></div>
          <div><div className="text-sm font-medium text-stone-700">Change Password</div><div className="text-[11px] text-stone-400">Get a reset link to update your password</div></div>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRequest} disabled={loading}
          className="px-4 py-2 rounded-xl text-xs font-medium bg-white text-stone-600 hover:bg-stone-100 border border-stone-200 transition-all disabled:opacity-50"
        >{loading ? "Generating..." : "Reset"}</motion.button>
      </div>
      <AnimatePresence>
        {resetLink && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-stone-100"
          >
            <p className="text-xs text-green-700 font-medium mb-2 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Reset link generated!</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white rounded-xl px-3 py-2 border border-stone-100 text-xs text-stone-500 truncate font-mono">{resetLink}</div>
              <button onClick={copyLink} className="p-2 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors" title="Copy link"><Copy className="w-3.5 h-3.5 text-stone-400" /></button>
              <a href={resetLink} target="_blank" className="p-2 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors" title="Open link"><Link2 className="w-3.5 h-3.5 text-stone-400" /></a>
            </div>
            <p className="text-[10px] text-stone-400 mt-2">This link expires in 1 hour. Open it to set a new password.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function DeleteAccountRow({ email }: { email: string }) {
  const [confirm, setConfirm] = useState(false)

  const handleDelete = async () => {
    const result = await deleteMyAccount(email)
    if (result.success) {
      toast.success("Account deleted. Goodbye!")
      signOut({ callbackUrl: "/" })
    } else {
      toast.error("Failed to delete account")
    }
  }

  return (
    <motion.div whileHover={{ x: 2 }} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50/50 border border-stone-100 hover:border-stone-200 transition-all">
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center"><Trash2 className="w-4 h-4 text-red-500" /></div>
        <div><div className="text-sm font-medium text-red-600">Delete Account</div><div className="text-[11px] text-stone-400">Permanently delete your account and data</div></div>
      </div>
      <AnimatePresence mode="wait">
        {confirm ? (
          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <button onClick={handleDelete} className="px-3 py-2 rounded-xl text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">Confirm</button>
            <button onClick={() => setConfirm(false)} className="px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors">Cancel</button>
          </motion.div>
        ) : (
          <motion.button key="delete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setConfirm(true)}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-all"
          >Delete</motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
