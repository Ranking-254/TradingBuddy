import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface AccountTransaction {
  id: string;
  accountId: string;
  type: "WITHDRAWAL" | "DEPOSIT";
  amount: number;
  note?: string;
  createdAt: string;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId query parameter required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("account_transactions")
      .select("*")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false });

    if (error) {
      // If table doesn't exist yet, return an empty array gracefully
      return NextResponse.json([]);
    }

    const formatted: AccountTransaction[] = (data || []).map((t: any) => ({
      id: t.id,
      accountId: t.account_id,
      type: t.type,
      amount: Number(t.amount),
      note: t.note,
      createdAt: t.created_at,
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error("Failed to fetch transactions:", err);
    return NextResponse.json([]);
  }
}

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
    const { accountId, type, amount, note } = body;

    if (!accountId || !type || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid transaction fields" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("account_transactions")
      .insert({
        account_id: accountId,
        user_id: user.id,
        type,
        amount: Number(amount),
        note: note || "",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      id: data.id,
      accountId: data.account_id,
      type: data.type,
      amount: Number(data.amount),
      note: data.note,
      createdAt: data.created_at,
    });
  } catch (err: any) {
    console.error("Failed to create transaction:", err);
    return NextResponse.json(
      { error: err.message || "Failed to log transaction" },
      { status: 500 },
    );
  }
}
