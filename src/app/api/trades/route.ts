import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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

// POST: Create a new trade (Resolves 405 Method Not Allowed)
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
    const {
      accountId,
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
      !accountId ||
      !symbol ||
      !side ||
      entryPrice === undefined ||
      exitPrice === undefined ||
      pnl === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required trade fields (accountId, symbol, side, prices, pnl)",
        },
        { status: 400 },
      );
    }

    // Verify ownership of the account
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.id },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Account not found or access denied" },
        { status: 404 },
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
