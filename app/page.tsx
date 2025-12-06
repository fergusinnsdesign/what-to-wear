"use client";

import { useState } from "react";

export default function Home() {
  const [city, setCity] = useState("London");            // Search field
  const [currentCity, setCurrentCity] = useState("London"); // Label shown on left

  const [weather, setWeather] = useState<any>(null);
  const [summary, setSummary] = useState("");
  const [videoSrc, setVideoSrc] = useState("");

  // Fade-in states
  const [textVisible, setTextVisible] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);

  async function fetchWeather() {
    if (!city.trim()) return;

    setWeather(null);
    setSummary("");
    setVideoVisible(false);

    // Save searched city as the display label
    setCurrentCity(city);

    const res = await fetch(`/api/weather?city=${city}`);
    const data = await res.json();
    if (data.error) return;

    setWeather(data);

    // Fetch Gemini summary
    const summaryRes = await fetch(`/api/summary`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    const summaryData = await summaryRes.json();
    setSummary(summaryData.sentence || "");

    setTimeout(() => setTextVisible(true), 150);

    const chosenVideo = pickVideo(data.temp, data.condition);
    setVideoSrc(`/avatars/${chosenVideo}`);

    // Reset ONLY the search box — not the label
    setTimeout(() => setCity(""), 1000);
  }

  function pickVideo(temp: number, condition: string) {
    if (condition.includes("rain")) return "08-raining.mp4";
    if (temp >= 28) return "01-hot.mp4";
    if (temp >= 22) return "02-warm.mp4";
    if (temp >= 16) return "03-mild.mp4";
    if (temp >= 12) return "04-cool.mp4";
    if (temp >= 7) return "05-cold.mp4";
    if (temp >= 2) return "06-frosty.mp4";
    return "07-freezing.mp4";
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, Helvetica Neue, SF Pro Display, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "40px",
      }}
    >
      {/* HEADER ROW */}
      <div
        style={{
          width: "500px",
          maxWidth: "90%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        {/* CITY LABEL */}
        <div
          style={{
            fontSize: "18px",
            fontWeight: 500,
            opacity: 0.6,
          }}
        >
          {currentCity}
        </div>

        {/* SEARCH INPUT */}
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search for location"
            style={{
              padding: "14px 22px",
              width: "200px",
              borderRadius: "24px",
              border: "1.5px solid #e6e6e6",
              fontSize: "15px",
            }}
          />
          <button
            onClick={fetchWeather}
            style={{
              padding: "14px 26px",
              background: "black",
              borderRadius: "24px",
              color: "white",
              fontWeight: 600,
              fontSize: "15px",
            }}
          >
            Go
          </button>
        </div>
      </div>

      {/* SUMMARY + VIDEO */}
      <div
        style={{
          width: "500px",
          maxWidth: "90%",
          textAlign: "left",
        }}
      >
        {/* FADE-IN SUMMARY */}
        <div
          style={{
            opacity: textVisible ? 1 : 0,
            transition: "opacity 0.8s ease",
          }}
        >
          {summary && (
            <p
              style={{
                fontSize: "28px",
                lineHeight: "1.35",
                fontWeight: 600,
                marginBottom: "18px",
              }}
            >
              {summary}
            </p>
          )}
        </div>

        {/* FADE-IN VIDEO */}
        {videoSrc && (
          <video
            key={videoSrc}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setVideoVisible(true)}
            style={{
              width: "100%",
              marginTop: "10px",
              opacity: videoVisible ? 1 : 0,
              transition: "opacity 1s ease",
              background: "transparent",
            }}
          />
        )}
      </div>
    </div>
  );
}