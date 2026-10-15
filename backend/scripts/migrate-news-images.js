import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptPath = fileURLToPath(import.meta.url);
const backendPath = path.resolve(path.dirname(scriptPath), "..");
const dataPath = path.join(backendPath, "data");
const newsItemsPath = path.join(dataPath, "newsItems.json");
const newsMediaPath = path.join(dataPath, "news-media");
const baseUrl = String(
  process.env.AJIX_NEWS_MEDIA_BASE_URL || "http://localhost:4000/api/news-media",
).replace(/\/$/, "");

const variants = [
  { key: "thumbnailUrl", suffix: "thumb", width: 320 },
  { key: "mediumImageUrl", suffix: "medium", width: 640 },
  { key: "largeImageUrl", suffix: "large", width: 1280 },
];

function parseDataImage(value = "") {
  const match = String(value || "").trim().match(/^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i);
  if (!match) return null;
  const encoded = match[2].replace(/\s+/g, "");
  const buffer = Buffer.from(encoded, "base64");
  return buffer.length ? buffer : null;
}

function safeId(value = "") {
  return String(value || "news").replace(/[^a-z0-9_-]/gi, "-").slice(0, 80) || "news";
}

async function main() {
  const source = JSON.parse(await fs.readFile(newsItemsPath, "utf8"));
  if (!Array.isArray(source)) throw new Error("newsItems.json must contain an array");

  await fs.mkdir(newsMediaPath, { recursive: true });
  const updates = [];
  const failures = [];
  let skipped = 0;

  for (const item of source) {
    const input = parseDataImage(item?.imageUrl);
    if (!input) {
      skipped += 1;
      continue;
    }

    const digest = crypto.createHash("sha1").update(input).digest("hex").slice(0, 12);
    const baseName = `news-${safeId(item.id)}-${digest}`;
    const urls = {};

    try {
      for (const variant of variants) {
        const fileName = `${baseName}-${variant.suffix}.webp`;
        const outputPath = path.join(newsMediaPath, fileName);
        try {
          await fs.access(outputPath);
        } catch {
          await sharp(input)
            .rotate()
            .resize({ width: variant.width, withoutEnlargement: true })
            .webp({ quality: 78 })
            .toFile(outputPath);
        }
        urls[variant.key] = `${baseUrl}/${fileName}`;
      }
      updates.push({ item, urls });
    } catch (error) {
      failures.push({ id: item?.id || "unknown", error: error.message || String(error) });
    }
  }

  if (failures.length) {
    console.error(JSON.stringify({ ok: false, failures }, null, 2));
    process.exitCode = 1;
    return;
  }

  const migrated = new Set(updates.map(({ item }) => item));
  const next = source.map((item) => {
    const update = updates.find((entry) => entry.item === item);
    if (!update) return item;
    return {
      ...item,
      imageUrl: update.urls.largeImageUrl,
      thumbnailUrl: update.urls.thumbnailUrl,
      mediumImageUrl: update.urls.mediumImageUrl,
      largeImageUrl: update.urls.largeImageUrl,
      updatedAt: new Date().toISOString(),
    };
  });

  const tempPath = `${newsItemsPath}.migration-${process.pid}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  await fs.rename(tempPath, newsItemsPath);

  console.log(JSON.stringify({
    ok: true,
    total: source.length,
    migrated: migrated.size,
    skipped,
    mediaDirectory: newsMediaPath,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
