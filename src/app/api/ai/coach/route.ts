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

    // 1. Fetch recent trades for ledger context
    const trades = await prisma.trade.findMany({
      where: { accountId },
      orderBy: { closeTime: "desc" },
      take: 40,
    });

    const totalTrades = trades.length;
    const wins = trades.filter((t) => t.pnl > 0);
    const losses = trades.filter((t) => t.pnl < 0);
    const netPnl = trades.reduce((acc, t) => acc + t.pnl, 0);
    const winRate =
      totalTrades > 0 ? ((wins.length / totalTrades) * 100).toFixed(1) : "0.0";
    const rulesFollowed = trades.filter((t) => t.followedRules).length;
    const ruleFollowRate =
      totalTrades > 0
        ? ((rulesFollowed / totalTrades) * 100).toFixed(1)
        : "100.0";
    const fomoTrades = trades.filter(
      (t) => t.emotion === "FOMO" || t.emotion === "REVENGE",
    ).length;

    const systemPrompt = `You are "Trading Buddy" — an elite institutional trading coach, risk manager, and quantitative behavioral analyst. 
You evaluate executions through risk management, expectancy, and psychology over short-term dollar outcomes.
${enableWebSearch ? "You have real-time live internet access. When asked about current stock prices, earnings, macroeconomic data (CPI, NFP, Fed interest rates), or live financial events, ground your answers in the latest web data." : ""}

Current Account Stats:
• Trades: ${totalTrades}
• Net P&L: $${netPnl.toFixed(2)}
• Win Rate: ${winRate}% (${wins.length}W / ${losses.length}L)
• Rules Followed: ${ruleFollowRate}%
• Tilt/FOMO Flags: ${fomoTrades}

Recent Trade Ledger Sample:
${JSON.stringify(
  trades.slice(0, 15).map((t) => ({
    pair: t.symbol,
    side: t.side,
    size: t.lotSize,
    pnl: t.pnl,
    session: t.session,
    strategy: t.strategy,
    followedRules: t.followedRules,
    emotion: t.emotion,
    notes: t.notes,
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
            ruleFollowRate,
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
