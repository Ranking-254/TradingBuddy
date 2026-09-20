export interface ParsedMT5Trade {
  ticketId: string;
  openTime: string;
  closeTime: string;
  symbol: string;
  side: "LONG" | "SHORT";
  lotSize: number;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  pnl: number;
  commissionAndSwap: number;
}

export function parseMT5Report(content: string): ParsedMT5Trade[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  const rows = Array.from(doc.querySelectorAll("tr"));

  const trades: ParsedMT5Trade[] = [];
  let isPositionsSection = false;

  for (const row of rows) {
    const text = row.innerText || row.textContent || "";

    // Identify the "Positions" table in standard MT5 reports
    if (
      text.includes("Positions") ||
      text.includes("Closed Deals") ||
      text.includes("Orders")
    ) {
      isPositionsSection = true;
      continue;
    }

    // Stop if we hit Orders/Summary sections
    if (
      isPositionsSection &&
      (text.includes("Orders") || text.includes("Working Orders"))
    ) {
      isPositionsSection = false;
      break;
    }

    const cells = Array.from(row.querySelectorAll("td")).map(
      (c) => c.textContent?.trim() || "",
    );

    // Standard MT5 row has around 13-15 columns:
    // [0: Time Open, 1: Position/Ticket, 2: Symbol, 3: Type (buy/sell), 4: Volume, 5: Price Open, 6: S/L, 7: T/P, 8: Time Close, 9: Price Close, 10: Commission, 11: Swap, 12: Profit]
    if (cells.length >= 12) {
      const typeStr = cells[3]?.toLowerCase();
      if (typeStr === "buy" || typeStr === "sell") {
        const ticket = cells[1];
        const symbol = cells[2];
        const volume = parseFloat(cells[4].replace(/,/g, "")) || 0.01;
        const openPrice = parseFloat(cells[5].replace(/,/g, "")) || 0;
        const sl = parseFloat(cells[6].replace(/,/g, "")) || null;
        const tp = parseFloat(cells[7].replace(/,/g, "")) || null;
        const openTime = cells[0];
        const closeTime = cells[8] || cells[0];
        const closePrice = parseFloat(cells[9].replace(/,/g, "")) || 0;
        const swap = parseFloat(cells[11]?.replace(/,/g, "") || "0") || 0;
        const profit =
          parseFloat(cells[cells.length - 1]?.replace(/,/g, "") || "0") || 0;

        trades.push({
          ticketId: ticket,
          openTime: new Date(openTime.replace(/\./g, "-")).toISOString(),
          closeTime: new Date(closeTime.replace(/\./g, "-")).toISOString(),
          symbol: symbol.toUpperCase(),
          side: typeStr === "buy" ? "LONG" : "SHORT",
          lotSize: volume,
          entryPrice: openPrice,
          exitPrice: closePrice,
          stopLoss: sl && sl > 0 ? sl : null,
          takeProfit: tp && tp > 0 ? tp : null,
          commissionAndSwap: swap,
          pnl: profit,
        });
      }
    }
  }

  return trades;
}
