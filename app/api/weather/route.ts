import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");

  if (!city) {
    return NextResponse.json({ error: "City is required" }, { status: 400 });
  }

  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Weather API key not set" },
      { status: 500 }
    );
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.cod !== 200) {
      return NextResponse.json(
        { error: "Weather API error", details: data },
        { status: 400 }
      );
    }

    const temp = data.main.temp;
    const feelsLike = data.main.feels_like;
    const condition = data.weather[0].description.toLowerCase();

    // --- WEATHER → AVATAR LOGIC ---
    const pickAvatar = () => {
      if (
        condition.includes("rain") ||
        condition.includes("drizzle") ||
        condition.includes("shower") ||
        condition.includes("thunder")
      ) {
        return "08-raining.mp4";
      }

      if (temp >= 26) return "01-hot.mp4";
      if (temp >= 20) return "02-warm.mp4";
      if (temp >= 14) return "03-mild.mp4";
      if (temp >= 10) return "04-cool.mp4";
      if (temp >= 6) return "05-cold.mp4";
      if (temp >= 1) return "06-frosty.mp4";
      return "07-freezing.mp4";
    };

    return NextResponse.json({
      city: data.name,
      temp,
      feelsLike,
      condition,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      avatar: pickAvatar(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch weather", details: err },
      { status: 500 }
    );
  }
}