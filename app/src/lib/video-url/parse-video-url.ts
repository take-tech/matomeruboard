import type { ParsedVideoUrl } from "../../types/reference-share";

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

const NICONICO_HOSTS = new Set([
  "nicovideo.jp",
  "www.nicovideo.jp",
]);

export class UnsupportedVideoUrlError extends Error {
  constructor(message = "Unsupported video URL") {
    super(message);
    this.name = "UnsupportedVideoUrlError";
  }
}

export function parseVideoUrl(input: string): ParsedVideoUrl {
  const videoUrl = input.trim();

  if (!videoUrl) {
    throw new UnsupportedVideoUrlError("Video URL is required.");
  }

  let url: URL;
  try {
    url = new URL(videoUrl);
  } catch {
    throw new UnsupportedVideoUrlError("Video URL is invalid.");
  }

  const host = url.hostname.toLowerCase();

  if (YOUTUBE_HOSTS.has(host)) {
    return parseYouTubeUrl(url, videoUrl);
  }

  if (NICONICO_HOSTS.has(host)) {
    return parseNiconicoUrl(url, videoUrl);
  }

  throw new UnsupportedVideoUrlError("Only YouTube and niconico URLs are supported.");
}

function parseYouTubeUrl(url: URL, videoUrl: string): ParsedVideoUrl {
  let videoId = "";

  if (url.hostname.toLowerCase() === "youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
  } else if (url.pathname === "/watch") {
    videoId = url.searchParams.get("v") ?? "";
  }

  if (!videoId) {
    throw new UnsupportedVideoUrlError("Unsupported YouTube URL.");
  }

  return {
    platform: "youtube",
    videoId,
    videoUrl,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  };
}

function parseNiconicoUrl(url: URL, videoUrl: string): ParsedVideoUrl {
  const segments = url.pathname.split("/").filter(Boolean);
  const isWatchPath = segments.length === 2 && segments[0] === "watch";
  const videoId = isWatchPath ? segments[1] ?? "" : "";

  if (!videoId) {
    throw new UnsupportedVideoUrlError("Unsupported niconico URL.");
  }

  return {
    platform: "niconico",
    videoId,
    videoUrl,
    embedUrl: `https://embed.nicovideo.jp/watch/${videoId}`,
  };
}
