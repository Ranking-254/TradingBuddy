import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      accountId,
      action,
      messages,
      userQuestion,
      model,
      enableWebSearch,
    } = body;

    const targetModel = model || DEFAULT_MODEL;

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 },
      );
    }

    // 1. Fetch Account Details & Risk Rules
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    // 2. Fetch Recent Trades for Ledger & Analytics Context
    const trades = await prisma.trade.findMany({
      where: { accountId },
      orderBy: { closeTime: "desc" },
      take: 60,
    });

    // 3. Fetch Real Cash Flow Transactions (Deposits, Withdrawals, Payouts)
    const transactions = await prisma.accountTransaction.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    // --- Analytics Calculations ---
    const totalTrades = trades.length;
    const wins = trades.filter((t) => t.pnl > 0);
    const losses = trades.filter((t) => t.pnl < 0);
    const grossProfit = wins.reduce((acc, t) => acc + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));
    const netPnl = trades.reduce((acc, t) => acc + t.pnl, 0);

    const winRate =
      totalTrades > 0 ? ((wins.length / totalTrades) * 100).toFixed(1) : "0.0";
    const profitFactor =
      grossLoss > 0
        ? (grossProfit / grossLoss).toFixed(2)
        : grossProfit > 0
          ? "Max (No Losses)"
          : "0.00";
    const avgWin =
      wins.length > 0 ? (grossProfit / wins.length).toFixed(2) : "0.00";
    const avgLoss =
      losses.length > 0 ? (grossLoss / losses.length).toFixed(2) : "0.00";

    const rulesFollowed = trades.filter((t) => t.followedRules).length;
    const ruleFollowRate =
      totalTrades > 0
        ? ((rulesFollowed / totalTrades) * 100).toFixed(1)
        : "100.0";

    // Cash Flow Totals
    const totalDeposits = transactions
      .filter((tx) => tx.type.toUpperCase() === "DEPOSIT")
      .reduce((acc, tx) => acc + Number(tx.amount), 0);
    const totalWithdrawals = transactions
      .filter(
        (tx) =>
          tx.type.toUpperCase() === "WITHDRAWAL" ||
          tx.type.toUpperCase() === "PAYOUT",
      )
      .reduce((acc, tx) => acc + Number(tx.amount), 0);

    const initialBal = account?.initialBalance || 10000;
    const currentEquity =
      initialBal + netPnl + totalDeposits - totalWithdrawals;

    // Session Performance Breakdown
    const sessionStats: Record<string, { trades: number; pnl: number }> = {};
    trades.forEach((t) => {
      const s = t.session || "UNSPECIFIED";
      if (!sessionStats[s]) sessionStats[s] = { trades: 0, pnl: 0 };
      sessionStats[s].trades += 1;
      sessionStats[s].pnl += t.pnl;
    });

    // Directional Edge
    const longTrades = trades.filter((t) => t.side.toUpperCase() === "LONG");
    const shortTrades = trades.filter((t) => t.side.toUpperCase() === "SHORT");
    const longPnL = longTrades.reduce((acc, t) => acc + t.pnl, 0);
    const shortPnL = shortTrades.reduce((acc, t) => acc + t.pnl, 0);

    // Psychology & Tilt Audit
    const fomoCount = trades.filter((t) => t.emotion === "FOMO").length;
    const revengeCount = trades.filter((t) => t.emotion === "REVENGE").length;
    const anxiousCount = trades.filter((t) => t.emotion === "ANXIOUS").length;
    const calmCount = trades.filter((t) => t.emotion === "CALM").length;

    const systemPrompt = `You are "Trading Buddy" — an elite institutional trading coach, risk manager, and quantitative behavioral psychologist built directly into the TradingBuddy journal platform.
You evaluate executions through risk management, expectancy, and psychology over short-term dollar outcomes.
${enableWebSearch ? "You have real-time live internet access. When asked about current stock prices, earnings, macroeconomic data (CPI, NFP, Fed interest rates), or live financial events, ground your answers in the latest web data." : ""}

About the Platform (TradingBuddy):
• What TradingBuddy Is: A professional-grade discipline journal and edge intelligence app engineered for active prop and retail traders.
• How It Helps: It bridges the gap between technical setups and psychological discipline. It tracks rule compliance, session edge, execution variances, and financial cash flows to stop emotional tilt, revenge trading, and overleveraging before they blow accounts.
• Core Capabilities: Live MT5 statement synchronization, real-time command center analytics, economic catalyst overlay calendar, discipline auditing, cash-flow/payout tracking, and institutional AI executive reviews.
• Tone: Elite prop firm risk desk manager. Confident, encouraging, strictly data-grounded, empathetic to trader psychology, yet uncompromising on rule compliance and capital preservation. Greet traders warmly when spoken to.

Active Account Profile:
• Account Name: ${account?.name || "Main Ledger"} (${account?.broker || "Direct Broker"})
• Currency: ${account?.currency || "USD"}
• Starting Balance: $${initialBal.toFixed(2)}
• Current Estimated Balance: $${currentEquity.toFixed(2)}
• Max Risk Cap: ${account?.maxRisk ?? 2.0}% per trade
• Max Drawdown Limit: ${account?.maxDrawdown ?? 5.0}%

Cash Flow & Payout History:
• Total Secured Withdrawals / Payouts: $${totalWithdrawals.toFixed(2)} (${transactions.filter((tx) => tx.type.toUpperCase() === "WITHDRAWAL" || tx.type.toUpperCase() === "PAYOUT").length} payouts)
• Total Deposits: $${totalDeposits.toFixed(2)}
• Recent Transaction Log:
${
  transactions.length === 0
    ? "No transaction records logged yet."
    : JSON.stringify(
        transactions.slice(0, 10).map((tx) => ({
          type: tx.type,
          amount: tx.amount,
          note: tx.note,
          date: tx.createdAt,
        })),
        null,
        2,
      )
}

Performance & Behavioral Analytics:
• Total Trades Executed: ${totalTrades}
• Net Realized P&L: $${netPnl.toFixed(2)}
• Win Rate: ${winRate}% (${wins.length} Wins / ${losses.length} Losses)
• Profit Factor: ${profitFactor}
• Average Win: $${avgWin} | Average Loss: $${avgLoss}
• Rule Discipline Adherence: ${ruleFollowRate}% (${rulesFollowed}/${totalTrades} followed plan)
• Emotional State Distribution: Calm: ${calmCount} | FOMO: ${fomoCount} | Revenge/Tilt: ${revengeCount} | Anxious: ${anxiousCount}
• Directional Variance: Long P&L: $${longPnL.toFixed(2)} (${longTrades.length} trades) | Short P&L: $${shortPnL.toFixed(2)} (${shortTrades.length} trades)
• Session Edge Breakdown: ${JSON.stringify(sessionStats)}

Recent Trade Ledger Sample:
${JSON.stringify(
  trades.slice(0, 15).map((t) => ({
    pair: t.symbol,
    side: t.side,
    size: t.lotSize,
    entry: t.entryPrice,
    exit: t.exitPrice,
    pnl: t.pnl,
    session: t.session,
    strategy: t.strategy,
    confluences: t.confluences,
    followedRules: t.followedRules,
    emotion: t.emotion,
    notes: t.notes,
    closed: t.closeTime,
  })),
  null,
  2,
)}

Formatting Rules:
1. NEVER use excessive dashes or hyphen bullets (avoid "- **Title:**").
2. Organize sections with clean bold headings (### Heading) and numbered lists (1., 2., 3.) or structured paragraphs.
3. Use bold (**like this**) for key metrics, tickers, and price levels, and italics (*like this*) for coaching commentary.
4. Keep answers crisp, structured, and actionable.`;

    // 2. Weekly Executive Analysis
    if (action === "generate-weekly-report") {
      const prompt = `Conduct a comprehensive weekly executive review of my trading.
Format strictly with these sections:
### 1. Performance Grade (A, B, C, D, or F) & Executive Overview
### 2. Behavioral & Discipline Breakdown (Identify tilt, sizing errors, or session bias)
### 3. Setup Expectancy (Which setups or sessions are producing edge)
### 4. Direct Tactical Prescriptions for Next Week (Use a numbered list: 1, 2, 3)`;

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Trading Buddy AI",
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
            temperature: 0.4,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "OpenRouter request failed");
      }

      const analysisText =
        data.choices[0]?.message?.content || "No analysis generated.";
      const gradeMatch = analysisText.match(/Grade[:\s]+([A-F][+-]?)/i);
      const grade = gradeMatch ? gradeMatch[1] : "B+";

      const savedReport = await prisma.aIReport.create({
        data: {
          accountId,
          weekRange: new Date().toISOString().slice(0, 10),
          grade,
          analysis: analysisText,
          metricsJSON: {
            totalTrades,
            netPnl,
            winRate,
            profitFactor,
            ruleFollowRate,
            totalWithdrawals,
          },
        },
      });

      return NextResponse.json(savedReport);
    }

    // 3. Interactive Chat with Coach (+ Live Web Search Tool)
    if (action === "chat") {
      const conversation = [
        { role: "system", content: systemPrompt },
        ...(messages || []),
        { role: "user", content: userQuestion },
      ];

      const requestPayload: any = {
        model: targetModel,
        messages: conversation,
        temperature: 0.6,
      };

      // If Web Search is turned on, inject OpenRouter's server-side search tool
      if (enableWebSearch) {
        requestPayload.tools = [{ type: "openrouter:web_search" }];
      }

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Trading Buddy AI Coach",
          },
          body: JSON.stringify(requestPayload),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "OpenRouter chat failed");
      }

      const reply =
        data.choices[0]?.message?.content || "I couldn't process that query.";
      return NextResponse.json({ reply });
    }

    // 4. Fetch Past AI Reports
    if (action === "get-reports") {
      const reports = await prisma.aIReport.findMany({
        where: { accountId },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      return NextResponse.json(reports);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("AI Coach Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to communicate with AI Coach" },
      { status: 500 },
    );
  }
}
