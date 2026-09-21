"use client";

import React, { useState } from "react";
import { useAccount, Account } from "@/context/AccountContext";
import { Money, getCurrencySymbol } from "@/components/common/Money";
import {
  Plus,
  ShieldAlert,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

export default function SettingsPage() {
  const { accounts, refreshAccounts, selectedAccountId, setSelectedAccountId } =
    useAccount();

  // New Account State
  const [accountName, setAccountName] = useState("");
  const [broker, setBroker] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [initialBalance, setInitialBalance] = useState("10000");
  const [newMaxRisk, setNewMaxRisk] = useState("2.0");
  const [newMaxDrawdown, setNewMaxDrawdown] = useState("5.0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Edit Account State & Modal
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editName, setEditName] = useState("");
  const [editBroker, setEditBroker] = useState("");
  const [editCurrency, setEditCurrency] = useState("USD");
  const [editBalance, setEditBalance] = useState("");
  const [editMaxRisk, setEditMaxRisk] = useState("2.0");
  const [editMaxDrawdown, setEditMaxDrawdown] = useState("5.0");
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle Create Account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) return;

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/accounts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: accountName,
          broker,
          currency,
          initialBalance: parseFloat(initialBalance) || 0,
          maxRisk: parseFloat(newMaxRisk) || 2.0,
          maxDrawdown: parseFloat(newMaxDrawdown) || 5.0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create account");
      }

      const newAccount = await res.json();
      await refreshAccounts();
      setSelectedAccountId(newAccount.id);

      setStatusMsg({
        type: "success",
        text: `Account "${accountName}" added successfully!`,
      });
      setAccountName("");
      setBroker("");
      setInitialBalance("10000");
      setNewMaxRisk("2.0");
      setNewMaxDrawdown("5.0");
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message || "Failed to create account",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (acc: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAccount(acc);
    setEditName(acc.name);
    setEditBroker(acc.broker || "");
    setEditCurrency(acc.currency || "USD");
    setEditBalance(acc.initialBalance.toString());
    setEditMaxRisk((acc.maxRisk ?? 2.0).toString());
    setEditMaxDrawdown((acc.maxDrawdown ?? 5.0).toString());
  };

  // Submit Account Update
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    setIsUpdating(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/accounts/${editingAccount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          broker: editBroker,
          currency: editCurrency,
          initialBalance: parseFloat(editBalance) || 0,
          maxRisk: parseFloat(editMaxRisk) || 2.0,
          maxDrawdown: parseFloat(editMaxDrawdown) || 5.0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update account");
      }

      await refreshAccounts();
      setStatusMsg({
        type: "success",
        text: `Account "${editName}" updated successfully!`,
      });
      setEditingAccount(null);
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message || "Failed to update account",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async (acc: Account, e: React.MouseEvent) => {
    e.stopPropagation();

    if (accounts.length <= 1) {
      alert(
        "You cannot delete your only account. Create another account before removing this one.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${acc.name}"? All associated trades and records will be permanently removed.`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/accounts/${acc.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }

      await refreshAccounts();
      // If deleted account was selected, switch to the first available account
      if (selectedAccountId === acc.id) {
        const remaining = accounts.filter((a) => a.id !== acc.id);
        if (remaining.length > 0) {
          setSelectedAccountId(remaining[0].id);
        }
      }

      setStatusMsg({
        type: "success",
        text: `Account "${acc.name}" deleted successfully.`,
      });
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message || "Failed to delete account",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Journal Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your connected trading accounts, modify parameters, or retire
          finished challenges.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-xl flex items-center justify-between text-xs font-medium border ${
            statusMsg.type === "success"
              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
              : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-zinc-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Account Management Section */}
      <div className="p-6 rounded-2xl bg-[#0e101a] border border-[#1b1d2b] space-y-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Wallet className="h-4 w-4 text-purple-400" />
            <span>Trading Accounts</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Click an account card to activate it. Use the pencil or trash icons
            to edit details or delete.
          </p>
        </div>

        {/* Existing Accounts List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {accounts.map((acc) => {
            const isSelected = selectedAccountId === acc.id;
            return (
              <div
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${
                  isSelected
                    ? "bg-purple-600/15 border-purple-500/50 shadow-sm"
                    : "bg-[#141624] border-[#232536] hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white truncate pr-2">
                    {acc.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <span
                        className="h-2 w-2 rounded-full bg-emerald-400"
                        title="Active Account"
                      />
                    )}
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => openEditModal(acc, e)}
                        title="Edit Account Details"
                        className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-zinc-100 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteAccount(acc, e)}
                        title="Delete Account"
                        className="p-1 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 font-mono mt-1">
                  Broker: {acc.broker || "Standard MT5"}
                </p>
                <div className="flex items-center justify-between text-xs font-mono mt-2.5">
                  <span className="text-purple-300 font-semibold">
                    <Money
                      amount={acc.initialBalance}
                      currency={acc.currency}
                      decimals={0}
                    />{" "}
                    {acc.currency}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-sans">
                    Risk: {acc.maxRisk ?? 2}% | DD: {acc.maxDrawdown ?? 5}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create New Account Form */}
        <form
          onSubmit={handleCreateAccount}
          className="p-4 bg-[#121320] border border-[#1f2235] rounded-xl space-y-4"
        >
          <p className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5 text-purple-400" />
            <span>Register New Account</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[11px] text-zinc-400">Account Name</label>
              <input
                type="text"
                required
                placeholder="e.g. FundingPips $25k"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full mt-1 p-2 rounded-md bg-[#181a29] border border-[#26283d] text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] text-zinc-400">
                Broker / Platform
              </label>
              <input
                type="text"
                placeholder="e.g. Exness, FTMO MT5"
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                className="w-full mt-1 p-2 rounded-md bg-[#181a29] border border-[#26283d] text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400">
                Balance ({getCurrencySymbol(currency)})
              </label>
              <input
                type="number"
                step="any"
                required
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full mt-1 p-2 rounded-md bg-[#181a29] border border-[#26283d] text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full mt-1 p-2 rounded-md bg-[#181a29] border border-[#26283d] text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-zinc-400">Max Risk %</label>
              <input
                type="number"
                step="0.1"
                required
                value={newMaxRisk}
                onChange={(e) => setNewMaxRisk(e.target.value)}
                className="w-full mt-1 p-2 rounded-md bg-[#181a29] border border-[#26283d] text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400">
                Daily DD Cutoff %
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={newMaxDrawdown}
                onChange={(e) => setNewMaxDrawdown(e.target.value)}
                className="w-full mt-1 p-2 rounded-md bg-[#181a29] border border-[#26283d] text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Adding Account..." : "Save Account"}
          </button>
        </form>
      </div>

      {/* Edit Account Modal */}
      {editingAccount && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e101a] border border-[#1b1d2b] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1b1d2b] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pencil className="h-4 w-4 text-purple-400" />
                <span>Edit Account Details</span>
              </h3>
              <button
                onClick={() => setEditingAccount(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateAccount} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-zinc-400">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-lg bg-[#141624] border border-[#26283d] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400">
                  Broker / Platform
                </label>
                <input
                  type="text"
                  value={editBroker}
                  onChange={(e) => setEditBroker(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-lg bg-[#141624] border border-[#26283d] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400">
                    Initial Balance ({getCurrencySymbol(editCurrency)})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editBalance}
                    onChange={(e) => setEditBalance(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-lg bg-[#141624] border border-[#26283d] text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400">Currency</label>
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-lg bg-[#141624] border border-[#26283d] text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] text-zinc-400">
                    Max Risk (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editMaxRisk}
                    onChange={(e) => setEditMaxRisk(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-lg bg-[#141624] border border-[#26283d] text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400">
                    Max Daily DD (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editMaxDrawdown}
                    onChange={(e) => setEditMaxDrawdown(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-lg bg-[#141624] border border-[#26283d] text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1b1d2b]">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 rounded-lg bg-[#141624] text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Danger Zone: Delete User Account */}
      <div className="p-6 rounded-2xl bg-[#0e101a] border border-rose-500/20 space-y-4">
        <div>
          <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Danger Zone</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Permanently delete your profile, trading accounts, journal entries,
            and AI coaching data.
          </p>
        </div>

        <button
          onClick={async () => {
            const confirmed = window.confirm(
              "Are you sure you want to permanently delete your entire user account? All accounts and trades will be wiped.",
            );
            if (!confirmed) return;

            try {
              const res = await fetch("/api/auth/delete-account", {
                method: "DELETE",
              });
              if (res.ok) {
                window.location.href = "/register";
              } else {
                alert("Failed to delete user account.");
              }
            } catch (err) {
              alert("Error deleting user account.");
            }
          }}
          className="px-4 py-2 rounded-xl bg-rose-600/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all"
        >
          Delete User Account & Wipe All Data
        </button>
      </div>
    </div>
  );
}
