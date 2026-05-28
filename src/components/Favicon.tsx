import React from "react";

const Favicon: React.FC<{ url?: string; color?: string; className?: string }> = ({
  url,
  color,
  className,
}) => {
  const iconClass = className ?? "h-6 w-6 rounded-md";
  if (url) {
    try {
      const { hostname } = new URL(url);
      const src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
      return (
        <img
          src={src}
          alt=""
          className={`shrink-0 object-cover shadow-sm ${iconClass}`}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      );
    } catch {
      // Invalid URL, fallback to colored dot.
    }
  }
  return (
    <span
      className={`inline-block shrink-0 rounded-full ${iconClass}`}
      style={{ background: color ?? "#60a5fa" }}
    />
  );
};

export default Favicon;
