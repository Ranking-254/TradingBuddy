import type { Metadata } from "next";
import "./globals.css";
import { AccountProvider } from "@/context/AccountContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Trading Buddy | High-Edge Journal",
  description: "Disciplined execution and AI cognitive trading analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090a0f] text-zinc-100 min-h-screen antialiased selection:bg-purple-600 selection:text-white">
        <AccountProvider>
          <AppShell>{children}</AppShell>
        </AccountProvider>
      </body>
    </html>
  );
}
