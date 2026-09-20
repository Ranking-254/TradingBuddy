"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";

export interface Account {
  id: string;
  name: string;
  broker: string | null;
  currency: string;
  initialBalance: number;
  maxRisk: number;
  maxDrawdown: number;
}

interface AccountContextType {
  accounts: Account[];
  selectedAccountId: string | null;
  selectedAccount: Account | null;
  setSelectedAccountId: (id: string) => void;
  refreshAccounts: () => Promise<void>;
  isLoading: boolean;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/accounts", { cache: "no-store" });
      if (!res.ok) {
        setAccounts([]);
        setSelectedAccountId(null);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setAccounts(data);
        // If current selection is invalid or missing, pick the first account
        setSelectedAccountId((prev) => {
          const exists = data.some((a) => a.id === prev);
          return exists ? prev : data[0].id;
        });
      } else {
        setAccounts([]);
        setSelectedAccountId(null);
      }
    } catch (err) {
      console.error("Failed to load accounts", err);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchAccounts();

    // Re-fetch whenever user logs in or logs out
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "SIGNED_IN" ||
        event === "USER_UPDATED" ||
        event === "INITIAL_SESSION"
      ) {
        fetchAccounts();
      } else if (event === "SIGNED_OUT") {
        setAccounts([]);
        setSelectedAccountId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAccounts, supabase]);

  const selectedAccount =
    accounts.find((a) => a.id === selectedAccountId) || accounts[0] || null;

  return (
    <AccountContext.Provider
      value={{
        accounts,
        selectedAccountId,
        selectedAccount,
        setSelectedAccountId,
        refreshAccounts: fetchAccounts,
        isLoading,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}
