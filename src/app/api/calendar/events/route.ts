import { NextRequest, NextResponse } from "next/server";

export interface EconomicEvent {
  title: string;
  country: string;
  date: string; // "YYYY-MM-DD" or ISO
  impact: "High" | "Medium" | "Low" | "Holiday";
  forecast?: string | null;
  previous?: string | null;
}

// Generate deterministic schedule for any month and year
function getInstitutionalEventsForMonth(
  year: number,
  month: number,
): EconomicEvent[] {
  const events: EconomicEvent[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper to format date string "YYYY-MM-DD"
  const formatDateStr = (day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  let fridayCount = 0;
  let wednesdayCount = 0;
  let thursdayCount = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const dayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

    if (dayOfWeek === 5) {
      fridayCount++;
      // 1st Friday of month = US Non-Farm Payrolls (NFP) & Unemployment
      if (fridayCount === 1) {
        events.push({
          title: "Non-Farm Employment Change (NFP)",
          country: "USD",
          date: formatDateStr(day),
          impact: "High",
        });
        events.push({
          title: "US Unemployment Rate",
          country: "USD",
          date: formatDateStr(day),
          impact: "High",
        });
      }
      // 3rd Friday of Quarter (Mar, Jun, Sep, Dec) = Quadruple Witching OpEx
      if (fridayCount === 3 && [2, 5, 8, 11].includes(month)) {
        events.push({
          title: "Quarterly Options Expiration (OpEx)",
          country: "USD",
          date: formatDateStr(day),
          impact: "High",
        });
      }
    }

    if (dayOfWeek === 3) {
      wednesdayCount++;
      // 2nd Wednesday = US CPI (Consumer Price Index)
      if (wednesdayCount === 2) {
        events.push({
          title: "Core CPI Inflation (MoM / YoY)",
          country: "USD",
          date: formatDateStr(day),
          impact: "High",
        });
      }
      // 3rd or 4th Wednesday in Jan, Mar, May, Jun, Jul, Sep, Nov, Dec = FOMC Rate Decision
      if (
        (wednesdayCount === 3 || wednesdayCount === 4) &&
        [0, 2, 4, 5, 6, 8, 10, 11].includes(month)
      ) {
        events.push({
          title: "FOMC Federal Funds Rate Decision",
          country: "USD",
          date: formatDateStr(day),
          impact: "High",
        });
        events.push({
          title: "Fed Chair Press Conference",
          country: "USD",
          date: formatDateStr(day),
          impact: "High",
        });
      }
    }

    if (dayOfWeek === 4) {
      thursdayCount++;
      // 2nd Thursday = US PPI (Producer Price Index)
      if (thursdayCount === 2) {
        events.push({
          title: "Core PPI (MoM)",
          country: "USD",
          date: formatDateStr(day),
          impact: "High",
        });
      }
      // 1st Thursday = ECB Interest Rate Decision (European Central Bank)
      if (thursdayCount === 1) {
        events.push({
          title: "ECB Main Refinancing Rate",
          country: "EUR",
          date: formatDateStr(day),
          impact: "High",
        });
      }
      // Last Thursday = US GDP (Advance or Prelim)
      if (day > daysInMonth - 7) {
        events.push({
          title: "US Prelim GDP Annualized",
          country: "USD",
          date: formatDateStr(day),
          impact: "High",
        });
      }
    }

    // First business day of month = ISM Manufacturing PMI
    if (day <= 3 && dayOfWeek >= 1 && dayOfWeek <= 5) {
      events.push({
        title: "ISM Manufacturing PMI",
        country: "USD",
        date: formatDateStr(day),
        impact: "High",
      });
    }
  }

  return events;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");

    const now = new Date();
    const year = yearParam ? parseInt(yearParam) : now.getFullYear();
    const month = monthParam ? parseInt(monthParam) : now.getMonth();

    // 1. Get institutional base calendar for this month/year
    const baseEvents = getInstitutionalEventsForMonth(year, month);

    // 2. Try to fetch live weekly feed to enrich current week with exact forecast/actuals
    let liveEvents: EconomicEvent[] = [];
    try {
      const res = await fetch(
        "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
        {
          next: { revalidate: 3600 },
          headers: { "User-Agent": "TradingBuddy/1.0" },
        },
      );
      if (res.ok) {
        const raw = await res.json();
        liveEvents = raw
          .filter((e: any) => e.impact === "High" || e.impact === "Holiday")
          .map((e: any) => ({
            title: e.title,
            country: e.country,
            date: e.date.split("T")[0],
            impact: e.impact,
            forecast: e.forecast || null,
            previous: e.previous || null,
          }));
      }
    } catch {
      // Live feed silent fallback
    }

    // 3. Merge: replace base events with live events if date and country match
    const eventMap = new Map<string, EconomicEvent>();

    baseEvents.forEach((ev) => {
      const key = `${ev.date}_${ev.country}_${ev.title.slice(0, 8)}`;
      eventMap.set(key, ev);
    });

    liveEvents.forEach((ev) => {
      const key = `${ev.date}_${ev.country}_${ev.title.slice(0, 8)}`;
      eventMap.set(key, ev);
    });

    return NextResponse.json(Array.from(eventMap.values()));
  } catch (error: any) {
    console.error("Error generating events:", error);
    return NextResponse.json([]);
  }
}
