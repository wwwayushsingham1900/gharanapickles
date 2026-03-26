"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, LogOut, Store, Users } from "lucide-react";
import Image from "next/image";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Customers", href: "/admin/customers", icon: Users },
  ];

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-charcoal/10 flex flex-col z-40 hidden md:flex">
      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b border-charcoal/10">
        <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10 object-contain mr-3" />
        <div>
          <h2 className="font-serif font-medium text-lg text-charcoal-deep leading-tight">Admin<br/><span className="text-chilli text-sm italic">Workspace</span></h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-earth/10 text-earth" 
                  : "text-charcoal-light hover:text-earth hover:bg-charcoal/5"
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Links */}
      <div className="p-4 border-t border-charcoal/10 space-y-2">
        <Link 
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-charcoal-light hover:text-charcoal-deep transition-colors"
        >
          <Store className="w-5 h-5 text-mustard-dark" />
          View Storefront
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-charcoal-light hover:text-red-700 transition-colors w-full rounded-xl hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
