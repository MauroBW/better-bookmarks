import React from "react";
import { getColor } from "../data/sections";

const Favicon: React.FC<{ url?: string; color?: string }> = ({ url, color }) => {
  if (url) {
    try {
      const { hostname } = new URL(url);
      const src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
      return (
        <img
          src={src}
          alt=""
          className="mt-[2px] h-4 w-4 rounded-sm shadow-sm"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      );
    } catch {}
  }
  return (
    <span
      className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ background: color ?? getColor(0) }}
    />
  );
};

export default Favicon;
