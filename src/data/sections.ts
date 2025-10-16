import type { Section } from "../lib/types";

// paleta de colores para los bullets
const COLORS = ["#60a5fa", "#22d3ee", "#a78bfa", "#f59e0b", "#f43f5e"];

export const SECTIONS: Section[] = [
  {
    title: "Work",
    items: [
      { label: "GitHub Profile", url: "https://github.com/MauroBW" },
      { label: "Slack", url: "https://slack.com" },
      { label: "Jira", url: "https://jira.com" },
    ],
  },
  {
    title: "Learning",
    items: [
      { label: "MDN", url: "https://developer.mozilla.org" },
      { label: "React Docs", url: "https://react.dev" },
      { label: "Frontend Masters", url: "https://frontendmasters.com" },
    ],
  },
  {
    title: "Quick Links",
    icons: [
      { label: "Gmail", icon: "✉️", url: "https://mail.google.com" },
      { label: "Drive", icon: "🗂️", url: "https://drive.google.com" },
      { label: "Calendar", icon: "📆", url: "https://calendar.google.com" },
      { label: "ChatGPT", icon: "🤖", url: "https://chat.openai.com" },
    ],
  },
];

// export util para asignar colores dinámicos
export function getColor(index: number) {
  return COLORS[index % COLORS.length];
}
