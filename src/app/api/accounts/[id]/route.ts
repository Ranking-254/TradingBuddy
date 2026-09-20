import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// PUT: Update an existing account
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, broker, currency, initialBalance, maxRisk, maxDrawdown } =
      body;

    // Ensure the account belongs to the logged-in user
    const existing = await prisma.account.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Account not found or access denied" },
        { status: 404 },
      );
    }

    const updatedAccount = await prisma.account.update({
      where: { id },
      data: {
        name: name || existing.name,
        broker: broker !== undefined ? broker : existing.broker,
        currency: currency || existing.currency,
        initialBalance:
          initialBalance !== undefined
            ? parseFloat(initialBalance)
            : existing.initialBalance,
        maxRisk: maxRisk !== undefined ? parseFloat(maxRisk) : existing.maxRisk,
        maxDrawdown:
          maxDrawdown !== undefined
            ? parseFloat(maxDrawdown)
            : existing.maxDrawdown,
      },
    });

    return NextResponse.json(updatedAccount);
  } catch (error: any) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update account" },
      { status: 500 },
    );
  }
}

// DELETE: Delete an account and cascade delete its trades
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check count: Do not allow deleting the last remaining account
    const userAccountCount = await prisma.account.count({
      where: { userId: user.id },
    });

    if (userAccountCount <= 1) {
      return NextResponse.json(
        { error: "Cannot delete your only account. Create a new one first." },
        { status: 400 },
      );
    }

    const existing = await prisma.account.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Account not found or access denied" },
        { status: 404 },
      );
    }

    await prisma.account.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete account" },
      { status: 500 },
    );
  }
}
