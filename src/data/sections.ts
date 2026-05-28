import type { Workspace } from "../lib/types";

const COLORS = ["#60a5fa", "#22d3ee", "#a78bfa", "#f59e0b", "#f43f5e"];

export const DEFAULT_WORKSPACE: Workspace = {
  version: 2,
  preferences: {
    showFavicons: true,
    compactMode: false,
    cardRadius: 14,
    accentGlow: 70,
    textScale: 100,
    sectionScale: 100,
    backgroundDim: 55,
    wallpaperBlur: 0,
  },
  sections: [
    {
      id: "sec-work",
      title: "Work",
      kind: "links",
      color: "#2563eb",
      bookmarks: [
        { id: "bm-gh", label: "GitHub", url: "https://github.com" },
        { id: "bm-jira", label: "Jira", url: "https://jira.com" },
        { id: "bm-slack", label: "Slack", url: "https://slack.com" },
      ],
    },
    {
      id: "sec-learning",
      title: "Learning",
      kind: "links",
      color: "#7c3aed",
      bookmarks: [
        { id: "bm-mdn", label: "MDN", url: "https://developer.mozilla.org" },
        { id: "bm-react", label: "React Docs", url: "https://react.dev" },
        { id: "bm-fm", label: "Frontend Masters", url: "https://frontendmasters.com" },
      ],
    },
    {
      id: "sec-repos",
      title: "Repositories",
      kind: "repos",
      color: "#059669",
      bookmarks: [
        { id: "repo-1", label: "better-bookmarks", url: "https://github.com/maurobw/better-bookmarks" },
        { id: "repo-2", label: "vite", url: "https://github.com/vitejs/vite" },
        { id: "repo-3", label: "react", url: "https://github.com/facebook/react" },
      ],
    },
  ],
};

export function getColor(index: number) {
  return COLORS[index % COLORS.length];
}
