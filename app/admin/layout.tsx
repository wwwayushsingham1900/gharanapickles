"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  // Skip auth check for the login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthenticated(true); // Don't block login page
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/verify");
        if (res.ok) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
          router.replace("/admin/login");
        }
      } catch {
        setAuthenticated(false);
        router.replace("/admin/login");
      }
    };

    checkAuth();
  }, [pathname, router, isLoginPage]);

  // Login page renders without admin chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
          <p className="text-sm text-stone-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirecting
  if (!authenticated) {
    return null;
  }

  // Authenticated — render admin dashboard
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        {children}
      </div>
    </div>
  );
}
