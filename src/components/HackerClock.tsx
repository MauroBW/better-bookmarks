import { useEffect, useState } from "react";

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export default function HackerClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="hacker-clock" aria-live="polite">
      <span className="hacker-clock-label">SYS TIME</span>
      <strong>{formatClock(now)}</strong>
    </div>
  );
}
