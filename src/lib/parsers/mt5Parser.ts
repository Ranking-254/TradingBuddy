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

// Safely converts MT5 date string "2026.09.21 19:02:07" into valid ISO string
function parseMT5Date(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  // 1. Replace dots with hyphens: "2026.09.21" -> "2026-09-21"
  // 2. Replace space with T: "2026-09-21 19:02:07" -> "2026-09-21T19:02:07"
  const formatted = dateStr.trim().replace(/\./g, "-").replace(" ", "T");
  const d = new Date(formatted);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// Cleans numbers with spaces or commas (e.g. "3 000.00" or "-52.35")
function parseMT5Number(val: string): number {
  if (!val) return 0;
  const clean = val.replace(/\s+/g, "").replace(/,/g, "");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

export function parseMT5Report(content: string): ParsedMT5Trade[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  const rows = Array.from(doc.querySelectorAll("tr"));

  const trades: ParsedMT5Trade[] = [];
  let isPositionsSection = false;

  for (const row of rows) {
    const text = (row.innerText || row.textContent || "").trim();

    // 1. Start capturing strictly when we hit the Positions table header
    if (text.includes("Positions")) {
      isPositionsSection = true;
      continue;
    }

    // 2. Stop parsing as soon as we reach the "Orders" or "Deals" section
    if (
      isPositionsSection &&
      (text.startsWith("Orders") ||
        text.startsWith("Deals") ||
        text.includes("Working Orders"))
    ) {
      isPositionsSection = false;
      break;
    }

    if (!isPositionsSection) continue;

    // Filter out the empty column <td class="hidden"> that MT5 injects
    const tdElements = Array.from(row.querySelectorAll("td")).filter(
      (td) => !td.classList.contains("hidden"),
    );

    const cells = tdElements.map((c) => c.textContent?.trim() || "");

    // A valid closed Position row in MT5 contains 13 columns after stripping hidden cells:
    // [0: OpenTime, 1: Ticket, 2: Symbol, 3: Type, 4: Volume, 5: OpenPrice, 6: S/L, 7: T/P, 8: CloseTime, 9: ClosePrice, 10: Commission, 11: Swap, 12: Profit]
    if (cells.length >= 13) {
      const typeStr = cells[3]?.toLowerCase();

      if (typeStr === "buy" || typeStr === "sell") {
        const openTime = cells[0];
        const ticket = cells[1];
        const symbol = cells[2];
        const volume = parseMT5Number(cells[4]) || 0.01;
        const openPrice = parseMT5Number(cells[5]);
        const sl = parseMT5Number(cells[6]);
        const tp = parseMT5Number(cells[7]);
        const closeTime = cells[8];
        const closePrice = parseMT5Number(cells[9]);
        const commission = parseMT5Number(cells[10]);
        const swap = parseMT5Number(cells[11]);
        const profit = parseMT5Number(cells[12]);

        trades.push({
          ticketId: ticket,
          openTime: parseMT5Date(openTime),
          closeTime: parseMT5Date(closeTime),
          symbol: symbol.toUpperCase(),
          side: typeStr === "buy" ? "LONG" : "SHORT",
          lotSize: volume,
          entryPrice: openPrice,
          exitPrice: closePrice,
          stopLoss: sl > 0 ? sl : null,
          takeProfit: tp > 0 ? tp : null,
          commissionAndSwap: commission + swap,
          pnl: profit,
        });
      }
    }
  }

  return trades;
}
