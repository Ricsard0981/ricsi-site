// Fetches the latest public YouTube uploads via the channel RSS feed (no API key).
import { readFile, writeFile } from "node:fs/promises";

const cfg = JSON.parse(await readFile("data/config.json", "utf8"));
const id = cfg.youtube?.channelId;
if (!id || id.includes("YOUR_")) {
  console.log("No YouTube channelId set in data/config.json; skipping.");
  process.exit(0);
}

const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
if (!res.ok) throw new Error(`YouTube feed failed: ${res.status}`);
const xml = await res.text();

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 12).map(([, e]) => ({
  id: /<yt:videoId>([^<]+)</.exec(e)?.[1],
  title: decode(/<title>([^<]*)</.exec(e)?.[1] ?? ""),
  published: /<published>([^<]+)</.exec(e)?.[1],
})).filter((v) => v.id);

const next = { updated: new Date().toISOString(), videos };
const prev = JSON.parse(await readFile("data/latest.json", "utf8").catch(() => "{}"));
if (JSON.stringify(prev.videos) === JSON.stringify(videos)) { console.log("No change."); process.exit(0); }
await writeFile("data/latest.json", JSON.stringify(next, null, 2) + "\n");
console.log(`Wrote ${videos.length} videos.`);
