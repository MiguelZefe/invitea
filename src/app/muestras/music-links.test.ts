import { expect, it } from "vitest";
import { parseMusicProviderLink } from "./music-links";

it("accepts only supported Spotify and YouTube Music links and builds official players", () => {
  expect(parseMusicProviderLink("https://open.spotify.com/track/0123456789ABCDEFGHIJKL?si=test")).toEqual({
    provider: "Spotify",
    embedUrl: "https://open.spotify.com/embed/track/0123456789ABCDEFGHIJKL",
    sourceUrl: "https://open.spotify.com/track/0123456789ABCDEFGHIJKL",
  });
  expect(parseMusicProviderLink("https://open.spotify.com/intl-es/playlist/0123456789ABCDEFGHIJKL")).toMatchObject({
    provider: "Spotify",
    embedUrl: "https://open.spotify.com/embed/playlist/0123456789ABCDEFGHIJKL",
  });
  expect(parseMusicProviderLink("https://music.youtube.com/watch?v=AbCdEfGh123&list=example")).toEqual({
    provider: "YouTube Music",
    embedUrl: "https://www.youtube-nocookie.com/embed/AbCdEfGh123",
    sourceUrl: "https://music.youtube.com/watch?v=AbCdEfGh123",
  });
  expect(parseMusicProviderLink("https://music.youtube.com/playlist?list=PLC77007E23FF423C6&si=share")).toEqual({
    provider: "YouTube Music",
    embedUrl: "https://www.youtube-nocookie.com/embed?listType=playlist&list=PLC77007E23FF423C6",
    sourceUrl: "https://music.youtube.com/playlist?list=PLC77007E23FF423C6",
  });
});

it.each([
  "javascript:alert(1)",
  "http://open.spotify.com/track/0123456789ABCDEFGHIJKL",
  "https://open.spotify.com.evil.example/track/0123456789ABCDEFGHIJKL",
  "https://open.spotify.com/track/too-short",
  "https://open.spotify.com/artist/0123456789ABCDEFGHIJKL",
  "https://music.youtube.com/watch?v=bad",
  "https://music.youtube.com.evil.example/watch?v=AbCdEfGh123",
  "https://music.youtube.com/playlist?list=example",
  "https://music.youtube.com.evil.example/playlist?list=PLC77007E23FF423C6",
])("rejects unsupported or unsafe music link %s", (link) => {
  expect(parseMusicProviderLink(link)).toBeNull();
});
