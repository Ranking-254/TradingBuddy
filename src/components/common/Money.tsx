"use client";

import React from "react";
import { useAccount } from "@/context/AccountContext";

interface MoneyProps {
  amount: number | string | null | undefined;
  currency?: string;
  showSign?: boolean; // Prepends "+" for positive numbers
  colorize?: boolean; // Green for positive, Red for negative
  className?: string;
  decimals?: number;
}

export function getCurrencySymbol(curr?: string): string {
  switch (curr?.toUpperCase()) {
    case "GBP":
      return "£";
    case "EUR":
      return "€";
    case "JPY":
      return "¥";
    case "USD":
    default:
      return "$";
  }
}

export function Money({
  amount,
  currency,
  showSign = false,
  colorize = false,
  className = "",
  decimals = 2,
}: MoneyProps) {
  const { selectedAccount } = useAccount();

  const num = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  const isPositive = num > 0;
  const isNegative = num < 0;

  const targetCurrency = currency || selectedAccount?.currency || "USD";
  const sym = getCurrencySymbol(targetCurrency);

  // Format with thousands separator
  const formattedValue = Math.abs(num).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // Determine prefix sign
  let sign = "";
  if (isNegative) {
    sign = "-";
  } else if (showSign && isPositive) {
    sign = "+";
  }

  // Determine text color
  let colorClass = "";
  if (colorize) {
    if (isPositive) colorClass = "text-emerald-400";
    else if (isNegative) colorClass = "text-rose-400";
    else colorClass = "text-zinc-400";
  }

  return (
    <span className={`font-mono ${colorClass} ${className}`.trim()}>
      {sign}
      {sym}
      {formattedValue}
    </span>
  );
}
