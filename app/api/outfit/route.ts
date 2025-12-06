import { NextResponse } from "next/server";

/**
 * Main outfit selection logic
 * Maps temperature ranges + weather conditions → outfit image file
 */
export async function POST(req: Request) {
  try {
    const { weather } = await req.json();

    if (!weather) {
      return NextResponse.json({ error: "No weather data provided" }, { status: 400 });
    }

    const temp = weather.temp;              // number
    const condition = weather.condition;    // string (e.g. "rain", "snow")
    const wind = weather.wind;              // optional
    const humidity = weather.humidity;      // optional

    // ---- WEATHER OVERRIDES (always win) ----
    const lc = condition.toLowerCase();

    if (lc.includes("storm")) return ok("23-stormy.png");
    if (lc.includes("rain")) return ok("21-rainy.png");
    if (lc.includes("drizzle")) return ok("20-drizzly.png");
    if (lc.includes("snow")) return ok("24-snowy.png");
    if (lc.includes("wind") || wind > 12) return ok("22-windy.png");

    // ---- TEMPERATURE-BASED ----
    if (temp >= 25) return ok("01-hot.png");
    if (temp >= 18) return ok("02-warm.png");
    if (temp >= 12) return ok("03-mild.png");
    if (temp >= 8)  return ok("04-cool.png");
    if (temp >= 3)  return ok("05-cold.png");
    if (temp >= -3) return ok("06-frosty.png");

    return ok("07-freezing.png");

  } catch (err) {
    console.error("OUTFIT ERROR:", err);
    return NextResponse.json({ error: "Outfit generation failed" }, { status: 500 });
  }
}

/** Helper to format response */
function ok(filename: string) {
  return NextResponse.json({
    outfit: `/outfits/${filename}`,
  });
}