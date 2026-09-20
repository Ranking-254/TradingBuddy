import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let accounts = await prisma.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    // If a user has zero accounts (e.g. brand new user), automatically create their default account:
    if (accounts.length === 0) {
      const defaultAccount = await prisma.account.create({
        data: {
          userId: user.id,
          name: "Main Live MT5",
          broker: "MetaTrader 5",
          currency: "USD",
          initialBalance: 10000.0,
          maxRisk: 2.0,
          maxDrawdown: 5.0,
        },
      });
      accounts = [defaultAccount];
    }

    return NextResponse.json(accounts);
  } catch (error: any) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 },
    );
  }
}
