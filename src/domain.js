export const categories = [
  "Все идеи",
  "Юмор",
  "Переодевашки",
  "Полезности",
  "Распаковки",
];

// getRandomValues also works on ordinary HTTP hosts where randomUUID is absent.
export function referenceId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function assetUrl(path) {
  if (path.startsWith('data:')) return path;
  return `${import.meta.env?.BASE_URL ?? '/'}${path.replace(/^\//, '')}`;
}

export function instagramUrl(value) {
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      !["instagram.com", "www.instagram.com"].includes(url.hostname)
    )
      return null;
    const match = url.pathname.match(
      /^\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)\/?$/,
    );
    return match ? `https://www.instagram.com/reel/${match[1]}/` : null;
  } catch {
    return null;
  }
}

export function accountName(value) {
  const name = value
    .trim()
    .replace(/^https:\/\/(?:www\.)?instagram\.com\//, "")
    .replace(/^@/, "")
    .replace(/\/$/, "");
  return /^[a-zA-Z0-9._]{1,30}$/.test(name) ? name : null;
}

export function selectReels(
  reels,
  {
    query = "",
    category = "Все идеи",
    region = "all",
    savedOnly = false,
    saved = [],
    sort = "score",
  } = {},
) {
  const q = query.trim().toLocaleLowerCase("ru");
  return reels
    .filter(
      (r) =>
        (category === "Все идеи" || r.category === category) &&
        (region === "all" || r.region === region) &&
        (!savedOnly || saved.includes(r.id)) &&
        (!q ||
          `${r.title} ${r.creator} ${r.category} ${r.hook}`
            .toLocaleLowerCase("ru")
            .includes(q)),
    )
    .sort((a, b) =>
      sort === "recent"
        ? b.created - a.created
        : b.score - a.score || b.created - a.created,
    );
}
