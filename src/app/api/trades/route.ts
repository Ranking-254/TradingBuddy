import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// Helper to determine session if MT5 report doesn't provide it
function inferSession(dateObj: Date): string {
  const utcHour = dateObj.getUTCHours();
  if (utcHour >= 0 && utcHour < 7) return "ASIAN";
  if (utcHour >= 7 && utcHour < 12) return "LONDON";
  if (utcHour >= 12 && utcHour < 16) return "OVERLAP";
  return "NEW_YORK";
}

// GET: Fetch and filter trades for the selected account
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
        { error: "accountId query parameter is required" },
        { status: 400 },
      );
    }

    // Verify account belongs to the logged in user
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.id },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Account not found or access denied" },
        { status: 404 },
      );
    }

    const symbol = searchParams.get("symbol");
    const session = searchParams.get("session");
    const emotion = searchParams.get("emotion");
    const filter = searchParams.get("filter"); // "WINNERS", "LOSSES", "BREACHES"

    const whereClause: any = { accountId };

    if (symbol) {
      whereClause.symbol = {
        contains: symbol.toUpperCase(),
        mode: "insensitive",
      };
    }

    if (session && session !== "ALL") {
      whereClause.session = session;
    }

    if (emotion && emotion !== "ALL") {
      whereClause.emotion = emotion;
    }

    if (filter === "WINNERS") {
      whereClause.pnl = { gt: 0 };
    } else if (filter === "LOSSES") {
      whereClause.pnl = { lt: 0 };
    } else if (filter === "BREACHES") {
      whereClause.followedRules = false;
    }

    const trades = await prisma.trade.findMany({
      where: whereClause,
      orderBy: { closeTime: "desc" },
    });

    return NextResponse.json(trades);
  } catch (error: any) {
    console.error("Error fetching trades:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch trades" },
      { status: 500 },
    );
  }
}

// POST: Create a new single trade OR batch import MT5 trades
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
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 },
      );
    }

    // Verify ownership of the target account
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.id },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Account not found or access denied" },
        { status: 404 },
      );
    }

    // ==========================================
    // CASE A: Batch MT5 Statement Upload
    // ==========================================
    if (Array.isArray(body.trades)) {
      const incomingTrades = body.trades;
      if (incomingTrades.length === 0) {
        return NextResponse.json({ count: 0, message: "No trades to import" });
      }

      // Fetch existing ticket IDs for this account to prevent duplicate entries
      const incomingTickets = incomingTrades
        .map((t: any) => t.ticketId)
        .filter(Boolean);

      const existingTrades = await prisma.trade.findMany({
        where: {
          accountId,
          ticketId: { in: incomingTickets },
        },
        select: { ticketId: true },
      });

      const existingTicketSet = new Set(
        existingTrades.map((t) => t.ticketId).filter(Boolean),
      );

      // Filter out trades already present in the database
      const newTradesToInsert = incomingTrades
        .filter((t: any) => !t.ticketId || !existingTicketSet.has(t.ticketId))
        .map((t: any) => {
          const closeDate = t.closeTime ? new Date(t.closeTime) : new Date();
          const openDate = t.openTime ? new Date(t.openTime) : closeDate;

          return {
            accountId,
            ticketId: t.ticketId || null,
            symbol: (t.symbol || "UNKNOWN").toUpperCase(),
            side: t.side === "SHORT" ? "SHORT" : "LONG",
            lotSize: parseFloat(t.lotSize) || 0.01,
            entryPrice: parseFloat(t.entryPrice) || 0,
            exitPrice: parseFloat(t.exitPrice) || 0,
            stopLoss: t.stopLoss ? parseFloat(t.stopLoss) : null,
            takeProfit: t.takeProfit ? parseFloat(t.takeProfit) : null,
            pnl: parseFloat(t.pnl) || 0,
            commissionAndSwap: parseFloat(t.commissionAndSwap) || 0,
            openTime: openDate,
            closeTime: closeDate,
            session: t.session || inferSession(openDate),
            strategy: t.strategy || "MT5 Import",
            confluences: Array.isArray(t.confluences) ? t.confluences : [],
            followedRules:
              t.followedRules !== undefined ? Boolean(t.followedRules) : true,
            emotion: t.emotion || "CALM",
            notes: t.notes || null,
          };
        });

      if (newTradesToInsert.length > 0) {
        await prisma.trade.createMany({
          data: newTradesToInsert,
        });
      }

      return NextResponse.json(
        {
          success: true,
          count: newTradesToInsert.length,
          skipped: incomingTrades.length - newTradesToInsert.length,
        },
        { status: 201 },
      );
    }

    // ==========================================
    // CASE B: Single Manual Trade Log
    // ==========================================
    const {
      ticketId,
      symbol,
      side,
      lotSize,
      entryPrice,
      exitPrice,
      stopLoss,
      takeProfit,
      pnl,
      pipsOrPoints,
      commissionAndSwap,
      openTime,
      closeTime,
      session,
      strategy,
      confluences,
      followedRules,
      emotion,
      notes,
      screenshotBefore,
      screenshotAfter,
    } = body;

    if (
      !symbol ||
      !side ||
      entryPrice === undefined ||
      exitPrice === undefined ||
      pnl === undefined
    ) {
      return NextResponse.json(
        {
          error: "Missing required trade fields (symbol, side, prices, pnl)",
        },
        { status: 400 },
      );
    }

    const newTrade = await prisma.trade.create({
      data: {
        accountId,
        ticketId: ticketId || null,
        symbol: symbol.toUpperCase(),
        side,
        lotSize: parseFloat(lotSize) || 0.01,
        entryPrice: parseFloat(entryPrice),
        exitPrice: parseFloat(exitPrice),
        stopLoss:
          stopLoss !== undefined && stopLoss !== ""
            ? parseFloat(stopLoss)
            : null,
        takeProfit:
          takeProfit !== undefined && takeProfit !== ""
            ? parseFloat(takeProfit)
            : null,
        pnl: parseFloat(pnl),
        pipsOrPoints:
          pipsOrPoints !== undefined && pipsOrPoints !== ""
            ? parseFloat(pipsOrPoints)
            : null,
        commissionAndSwap: parseFloat(commissionAndSwap) || 0.0,
        openTime: openTime ? new Date(openTime) : new Date(),
        closeTime: closeTime ? new Date(closeTime) : new Date(),
        session: session || "NEW_YORK",
        strategy: strategy || null,
        confluences: Array.isArray(confluences) ? confluences : [],
        followedRules:
          followedRules !== undefined ? Boolean(followedRules) : true,
        emotion: emotion || "CALM",
        notes: notes || null,
        screenshotBefore: screenshotBefore || null,
        screenshotAfter: screenshotAfter || null,
      },
    });

    return NextResponse.json(newTrade, { status: 201 });
  } catch (error: any) {
    console.error("Error creating trade:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create trade" },
      { status: 500 },
    );
  }
}
