import { useEffect, useState } from "react";

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

type WeatherState = {
  temp: number;
  label: string;
} | null;

function getWeatherLabel(code: number) {
  const mapping: Record<number, string> = {
    0: "clear",
    1: "mostly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "fog",
    48: "rime fog",
    51: "light drizzle",
    53: "drizzle",
    55: "heavy drizzle",
    56: "freezing drizzle",
    57: "strong freezing drizzle",
    61: "light rain",
    63: "rain",
    65: "heavy rain",
    66: "freezing rain",
    67: "strong freezing rain",
    71: "light snow",
    73: "snow",
    75: "heavy snow",
    77: "snow grains",
    80: "rain showers",
    81: "heavy showers",
    82: "violent showers",
    85: "snow showers",
    86: "heavy snow showers",
    95: "thunderstorm",
    96: "thunder + hail",
    99: "severe storm",
  };
  return mapping[code] ?? "unknown";
}

export default function HackerClock() {
  const [now, setNow] = useState(() => new Date());
  const [weather, setWeather] = useState<WeatherState>(null);
  const [weatherStatus, setWeatherStatus] = useState("syncing...");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async (latitude: number, longitude: number) => {
      try {
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.searchParams.set("latitude", String(latitude));
        url.searchParams.set("longitude", String(longitude));
        url.searchParams.set("current", "temperature_2m,weather_code");
        url.searchParams.set("timezone", "auto");

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`weather http ${response.status}`);
        const payload = (await response.json()) as {
          current?: { temperature_2m?: number; weather_code?: number };
        };
        const temp = payload.current?.temperature_2m;
        const weatherCode = payload.current?.weather_code;
        if (typeof temp !== "number" || typeof weatherCode !== "number") throw new Error("invalid weather payload");

        if (cancelled) return;
        setWeather({
          temp: Math.round(temp),
          label: getWeatherLabel(weatherCode),
        });
        setWeatherStatus("online");
      } catch {
        if (cancelled) return;
        setWeatherStatus("offline");
      }
    };

    const run = () => {
      if (!navigator.geolocation) {
        void fetchWeather(-34.6037, -58.3816);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          void fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          void fetchWeather(-34.6037, -58.3816);
        },
        { timeout: 7000, maximumAge: 5 * 60 * 1000 }
      );
    };

    run();
    const weatherTimer = window.setInterval(run, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(weatherTimer);
    };
  }, []);

  return (
    <div className="hacker-clock" aria-live="polite">
      <div className="hacker-clock-row">
        <span className="hacker-clock-label">SYS TIME</span>
        <strong>{formatClock(now)}</strong>
      </div>
      <div className="hacker-clock-row hacker-clock-weather">
        <span className="hacker-clock-label">VAULT WX</span>
        <strong>{weather ? `${weather.temp}C ${weather.label}` : "--"}</strong>
        <span className="hacker-clock-status">{weatherStatus}</span>
      </div>
    </div>
  );
}
