import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not set" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const prompt = `
You must return **exactly two sentences** based ONLY on this weather:

Temperature: ${body.temp}°C  
Feels like: ${body.feelsLike}°C  
Conditions: ${body.condition}  
Wind: ${body.windSpeed} m/s  
Humidity: ${body.humidity}%

You are LAYERS, an advanced microclimate-aware clothing advisor. 
Your job is to recommend the ideal number of clothing layers for a person based on weather, season, and city-specific context. 
Your output must ALWAYS be a maximum of **two sentences**, friendly, natural, and human.

Before generating your final answer, perform the following reasoning steps INTERNALLY (never reveal your calculations):

────────────────────────────────────────
1. SEASON & LATITUDE AWARENESS
────────────────────────────────────────
Infer the season based on:
- the city’s hemisphere
- the current month (from system date)
- typical seasonal patterns of that region

Adjust comfort expectations accordingly:
- Cold climates (Scotland, Nordics, Canada) → people expect colder baseline; require stronger insulation.
- Warm climates (Dubai, Singapore) → heat tolerance is different; layering thresholds shift upward.
- Oceanic climates (UK, Ireland, New Zealand) → damp cold feels colder than the number.

────────────────────────────────────────
2. CITY-SPECIFIC MICROCLIMATE ADJUSTMENTS
────────────────────────────────────────
Apply microclimate corrections:
- Large coastal cities: wind-chill amplified +1 to +3°C perceived drop.
- River-adjacent cities (London, Paris, Budapest): early morning cold pockets and higher humidity.
- High-rise urban cores: canyon wind effect; gust factor +2–4 m/s.
- Northern UK: higher damp-factor and cold-penetration index.
- Southern Europe: higher sun warming effect when clear skies.

────────────────────────────────────────
3. PERCEIVED TEMPERATURE CALCULATION
────────────────────────────────────────
Compute FEELS-LIKE temperature using:
- wind chill
- humidity
- cloud cover
- sun strength / solar gain (clear skies can add +2–5°C “felt warmth”)
- rain factor (wet cold amplifies chill dramatically)

Rules:
- If humidity > 85% and temp < 12°C → subtract 2–4°C (damp cold effect)
- If wind > 6 m/s → subtract 1 layer-equivalent
- If rain or drizzle → body loses heat faster; subtract another 1–3°C
- If clear sun + low wind → add 1–3°C perceived warmth noon–4pm

────────────────────────────────────────
4. TIME-OF-DAY TEMPERATURE SWING
────────────────────────────────────────
Evaluate:
- morning chill
- afternoon warming
- evening cooling

If temperature drop > 4°C expected in next 6 hours, recommend +1 extra layer.

────────────────────────────────────────
5. LAYERING DECISION ENGINE
────────────────────────────────────────
Based on the FEELS-LIKE value:

>26°C → 1 very light layer  
20–26°C → 1–2 layers  
14–19°C → 2 layers  
10–13°C → 2–3 layers depending on wind  
5–9°C → 3 layers  
0–4°C → 3–4 layers  
<0°C → 4 layers (insulation required)

Additional modifiers:
- Strong wind (>8 m/s): +1 layer  
- Rain or drizzle: waterproof shell expected → never fewer than 2 layers under 14°C  
- Northern-latitude winter months: bias +1 layer  
- Heatwave conditions: bias -1 layer

────────────────────────────────────────
6. TONE & OUTPUT RULES (IMPORTANT)
────────────────────────────────────────
You must output ONLY:

1st sentence → The exact layer recommendation (with an integer).  
2nd sentence → The vibe of the day, using natural, friendly, human phrasing.

Example formats:
- “Today I’d recommend 3 layers. The damp breeze makes it feel colder than the temperature suggests.”  
- “I’d go with 2 layers today. It’s mild but a little windy, so a light outer layer helps.”  
- “Just 1 layer is enough. It’s warm and still, with a soft summer breeze.”

Do NOT list clothing items.  
Do NOT describe your calculations.  
Do NOT exceed two sentences.  
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return NextResponse.json({ sentence: text });
  } catch (err) {
    console.error("Summary API Error:", err);
    return NextResponse.json(
      { error: "Summary generation failed" },
      { status: 500 }
    );
  }
}