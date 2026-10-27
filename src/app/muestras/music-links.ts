export type MusicProviderPreview = {
  provider: "Spotify" | "YouTube Music";
  embedUrl: string;
  sourceUrl: string;
};

export function parseMusicProviderLink(input: string): MusicProviderPreview | null {
  if (input.length > 2048) return null;

  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return null;

  if (url.hostname === "open.spotify.com") {
    const match = url.pathname.match(/^\/(?:intl-[a-z]{2}\/)?(track|album|playlist)\/([A-Za-z0-9]{22})\/?$/);
    if (!match) return null;
    const [, kind, id] = match;
    return {
      provider: "Spotify",
      embedUrl: `https://open.spotify.com/embed/${kind}/${id}`,
      sourceUrl: `https://open.spotify.com/${kind}/${id}`,
    };
  }

  if (url.hostname === "music.youtube.com" && url.pathname === "/watch") {
    const id = url.searchParams.get("v");
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    return {
      provider: "YouTube Music",
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      sourceUrl: `https://music.youtube.com/watch?v=${id}`,
    };
  }

  if (url.hostname === "music.youtube.com" && url.pathname === "/playlist") {
    const id = url.searchParams.get("list");
    if (!id || !/^[A-Za-z0-9_-]{10,150}$/.test(id)) return null;
    return {
      provider: "YouTube Music",
      embedUrl: `https://www.youtube-nocookie.com/embed?listType=playlist&list=${id}`,
      sourceUrl: `https://music.youtube.com/playlist?list=${id}`,
    };
  }

  return null;
}
