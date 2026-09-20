"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAccount } from "@/context/AccountContext";
import { Menu, X } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { accounts, isLoading } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Standalone pages that should NEVER display the dashboard sidebar or header
  const isStandalonePage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/terms" ||
    pathname === "/privacy";

  // Visitor on landing page (logged out, 0 accounts loaded)
  const isPublicLanding =
    pathname === "/" && !isLoading && accounts.length === 0;

  if (isStandalonePage || isPublicLanding) {
    return <main className="min-h-screen bg-[#07080d]">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#07080d] text-zinc-100 flex flex-col lg:flex-row relative overflow-x-hidden">
      {/* Mobile Top Header with Hamburger */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0a0c16] border-b border-[#1b1e30] sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-purple-600 flex items-center justify-center font-black text-xs text-white shadow-md shadow-purple-900/40">
            TB
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            Trading<span className="text-purple-400">Buddy</span>
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-[#141624] border border-[#232740] text-zinc-300 hover:text-white transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Sidebar (Drawer on mobile, fixed left on lg) */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Desktop/Tablet Header */}
        <div className="sticky top-0 z-30 bg-[#07080d]/80 backdrop-blur-md">
          <Header />
        </div>

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
