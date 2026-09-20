"use client";

import React, { useState } from "react";
import {
  X,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Wallet,
} from "lucide-react";

interface CashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  onSuccess: () => void;
}

export function CashFlowModal({
  isOpen,
  onClose,
  accountId,
  onSuccess,
}: CashFlowModalProps) {
  const [type, setType] = useState<"WITHDRAWAL" | "DEPOSIT">("WITHDRAWAL");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg("Please enter a valid amount greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/accounts/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          type,
          amount: numericAmount,
          note: note.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to log transaction");
      }

      setAmount("");
      setNote("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to record cash flow");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0e101a] border border-[#1b1e30] w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#1b1e30] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Record Cash Flow
              </h3>
              <p className="text-[11px] text-zinc-400">
                Withdraw profit or fund your balance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Type Selector (Withdrawal vs Deposit) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#141624] border border-[#232740] rounded-2xl">
            <button
              type="button"
              onClick={() => setType("WITHDRAWAL")}
              className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === "WITHDRAWAL"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ArrowDownRight className="h-3.5 w-3.5" />
              <span>Withdrawal</span>
            </button>
            <button
              type="button"
              onClick={() => setType("DEPOSIT")}
              className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === "DEPOSIT"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Deposit</span>
            </button>
          </div>

          <div>
            <label className="text-zinc-300 font-medium">Amount ($ USD)</label>
            <div className="relative mt-1.5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-300 font-medium">
              Note / Reference (Optional)
            </label>
            <input
              type="text"
              placeholder={
                type === "WITHDRAWAL"
                  ? "e.g., Prop firm payout, bank transfer"
                  : "e.g., Additional capital top-up"
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-[#141624] border border-[#232740] text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#1b1e30]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#141624] hover:bg-[#1a1d30] text-zinc-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : `Confirm ${type === "WITHDRAWAL" ? "Withdrawal" : "Deposit"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
