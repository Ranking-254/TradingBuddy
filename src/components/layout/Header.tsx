"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAccount } from "@/context/AccountContext";
import { Plus, ChevronDown, Check, LogOut, User, LogIn } from "lucide-react";
import { LogTradeModal } from "@/components/trades/LogTradeModal";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function Header() {
  const { accounts, selectedAccountId, setSelectedAccountId, selectedAccount } =
    useAccount();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isLogTradeOpen, setIsLogTradeOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const router = useRouter();
  const supabase = createClient();
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch current user details
  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    getUser();
  }, [supabase]);

  // Click outside to close menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const userInitial =
    currentUser?.user_metadata?.full_name?.[0] ||
    currentUser?.email?.[0]?.toUpperCase() ||
    "T";

  return (
    <header className="w-full px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-[#1b1e30] flex items-center justify-between gap-2 sm:gap-4 relative z-30">
      {/* Left: Account Selector */}
      <div
        className="flex items-center gap-2 relative min-w-0"
        ref={accountMenuRef}
      >
        <div className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setUserDropdownOpen(false);
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0e101a] border border-[#202438] text-[11px] sm:text-xs font-semibold text-white flex items-center gap-1.5 sm:gap-2 hover:border-purple-500/50 transition-colors shadow-sm"
          >
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px]">
              {selectedAccount?.name || "Select Account"}
              <span className="hidden xs:inline text-zinc-400">
                {" "}
                • {selectedAccount?.currency || "USD"}
              </span>
            </span>
            <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-zinc-400 shrink-0" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-52 sm:w-60 rounded-2xl bg-[#0e101a] border border-[#202438] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <span className="text-[10px] uppercase font-bold text-zinc-500 px-2.5 py-1 block">
                Accounts
              </span>
              <div className="max-h-56 overflow-y-auto space-y-0.5">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      setSelectedAccountId(acc.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors text-left ${
                      acc.id === selectedAccountId
                        ? "bg-purple-600/20 text-purple-300 font-bold"
                        : "text-zinc-400 hover:text-white hover:bg-[#141624]"
                    }`}
                  >
                    <span className="truncate">{acc.name}</span>
                    {acc.id === selectedAccountId && (
                      <Check className="h-3.5 w-3.5 text-purple-400 shrink-0 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedAccount?.broker && (
          <span className="hidden md:inline-block text-[11px] text-zinc-500 font-medium truncate">
            Broker:{" "}
            <strong className="text-zinc-400">{selectedAccount.broker}</strong>
          </span>
        )}
      </div>

      {/* Right: Actions & User Session Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Log Trade Button */}
        <button
          onClick={() => setIsLogTradeOpen(true)}
          className="px-2.5 sm:px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 sm:gap-1.5 transition-all shadow-md shadow-purple-900/30 active:scale-95 shrink-0"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="text-[11px] sm:text-xs">Log Trade</span>
        </button>

        {/* User Profile / Auth Toggle */}
        <div className="relative" ref={userMenuRef}>
          {currentUser ? (
            <button
              onClick={() => {
                setUserDropdownOpen(!userDropdownOpen);
                setDropdownOpen(false);
              }}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center justify-center hover:bg-purple-600/50 hover:border-purple-400 transition-all shadow-sm"
              title={currentUser.email}
            >
              {userInitial}
            </button>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl bg-[#141624] border border-[#232740] text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <LogIn className="h-3.5 w-3.5 text-purple-400" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}

          {/* User Dropdown */}
          {userDropdownOpen && currentUser && (
            <div className="absolute top-full right-0 mt-2 w-52 sm:w-60 rounded-2xl bg-[#0e101a] border border-[#202438] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
              <div className="px-2.5 py-2 border-b border-[#1b1e30]">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser.user_metadata?.full_name || "Trader"}
                </p>
                <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                  {currentUser.email}
                </p>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Log Trade Modal */}
      {isLogTradeOpen && (
        <LogTradeModal
          isOpen={isLogTradeOpen}
          onClose={() => setIsLogTradeOpen(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </header>
  );
}
