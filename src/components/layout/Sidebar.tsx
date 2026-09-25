"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CandlestickChart,
  Globe2,
  CalendarDays,
  Bot,
  BarChart3,
  Wrench,
  Activity,
  Shield,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Trades", href: "/trades", icon: CandlestickChart },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Buddy AI", href: "/ai-buddy", icon: Bot, badge: "AI" },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Quick Tools", href: "/tools", icon: Wrench },
  { name: "Currency Strength", href: "/currency-strength", icon: Activity },
  { name: "Market Overview", href: "/market-overview", icon: Globe2 },
];

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#0a0c16] border-r border-[#1b1e30] flex flex-col justify-between p-4 z-50 transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between px-2 pt-2">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-3 group"
            >
              <div className="h-9 w-9 rounded-xl bg-purple-600 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform">
                TB
              </div>
              <div>
                <h2 className="font-bold text-base text-white tracking-tight leading-none">
                  Trading<span className="text-purple-400">Buddy</span>
                </h2>
                <span className="text-[10px] text-zinc-500 font-medium">
                  Discipline & Edge Journal
                </span>
              </div>
            </Link>

            {/* Close button visible only on mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider px-3">
              CORE HUB
            </span>
            <nav className="mt-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-white hover:bg-[#141624]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 ${
                          isActive ? "text-purple-400" : "text-zinc-500"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-600 text-white shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Guardrail Indicator */}
        <div className="space-y-3 pt-4 border-t border-[#1b1e30]">
          <div className="p-3 rounded-2xl bg-[#141624] border border-[#202438] space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
              <Shield className="h-3.5 w-3.5 text-purple-400" />
              <span>Strict Guardrails</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Discipline barriers active. Risk capped per setup.
            </p>
          </div>

          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-[#141624] transition-colors"
          >
            <Settings className="h-4 w-4 text-zinc-500" />
            <span>Journal Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
