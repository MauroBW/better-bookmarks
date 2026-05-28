export function clsx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  try {
    return new URL(trimmed).toString();
  } catch {
    try {
      return new URL(`https://${trimmed}`).toString();
    } catch {
      return "";
    }
  }
}

export type RepoProvider = "github" | "gitlab" | "bitbucket" | "other";

export function getRepoProvider(url: string): RepoProvider {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("github")) return "github";
    if (host.includes("gitlab")) return "gitlab";
    if (host.includes("bitbucket")) return "bitbucket";
    return "other";
  } catch {
    return "other";
  }
}

export function getRepoMeta(url: string) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const provider = getRepoProvider(url);
    return {
      provider,
      owner: parts[0] ?? "",
      repo: parts[1] ?? "",
    };
  } catch {
    return {
      provider: "other" as const,
      owner: "",
      repo: "",
    };
  }
}

export function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}