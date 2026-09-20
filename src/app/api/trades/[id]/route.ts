import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// PUT: Update an existing trade
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

    // Verify ownership through account relation
    const existing = await prisma.trade.findFirst({
      where: {
        id,
        account: {
          userId: user.id,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Trade not found or unauthorized" },
        { status: 404 },
      );
    }

    const {
      symbol,
      side,
      lotSize,
      entryPrice,
      exitPrice,
      stopLoss,
      takeProfit,
      pnl,
      session,
      strategy,
      confluences,
      followedRules,
      emotion,
      notes,
    } = body;

    const updatedTrade = await prisma.trade.update({
      where: { id },
      data: {
        symbol: symbol?.toUpperCase() || existing.symbol,
        side: side || existing.side,
        lotSize: lotSize !== undefined ? parseFloat(lotSize) : existing.lotSize,
        entryPrice:
          entryPrice !== undefined
            ? parseFloat(entryPrice)
            : existing.entryPrice,
        exitPrice:
          exitPrice !== undefined ? parseFloat(exitPrice) : existing.exitPrice,
        stopLoss:
          stopLoss !== undefined && stopLoss !== ""
            ? parseFloat(stopLoss)
            : null,
        takeProfit:
          takeProfit !== undefined && takeProfit !== ""
            ? parseFloat(takeProfit)
            : null,
        pnl: pnl !== undefined ? parseFloat(pnl) : existing.pnl,
        session: session !== undefined ? session : existing.session,
        strategy: strategy !== undefined ? strategy : existing.strategy,
        confluences: Array.isArray(confluences)
          ? confluences
          : existing.confluences,
        followedRules:
          followedRules !== undefined
            ? Boolean(followedRules)
            : existing.followedRules,
        emotion: emotion !== undefined ? emotion : existing.emotion,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    return NextResponse.json(updatedTrade);
  } catch (error: any) {
    console.error("Error updating trade:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update trade" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a single trade entry
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

    // Verify trade belongs to user's accounts
    const existing = await prisma.trade.findFirst({
      where: {
        id,
        account: {
          userId: user.id,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Trade not found or unauthorized" },
        { status: 404 },
      );
    }

    await prisma.trade.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting trade:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete trade" },
      { status: 500 },
    );
  }
}
