import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, broker, currency, initialBalance, maxRisk, maxDrawdown } =
      body;

    if (!name) {
      return NextResponse.json(
        { error: "Account name is required" },
        { status: 400 },
      );
    }

    const newAccount = await prisma.account.create({
      data: {
        userId: user.id,
        name,
        broker: broker || null,
        currency: currency || "USD",
        initialBalance: parseFloat(initialBalance) || 0,
        maxRisk: maxRisk ? parseFloat(maxRisk) : 2.0,
        maxDrawdown: maxDrawdown ? parseFloat(maxDrawdown) : 5.0,
      },
    });

    return NextResponse.json(newAccount);
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
