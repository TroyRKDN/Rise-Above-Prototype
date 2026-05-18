const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataPath = path.join(root, "data", "site-data.json");
const outDir = path.join(root, "assets", "img");
const manifestPath = path.join(root, "assets", "asset-map.json");

function safeName(url, used) {
  const u = new URL(url);
  let base = decodeURIComponent(path.posix.basename(u.pathname));
  if (!base || !base.includes(".")) base = "asset.bin";
  base = base
    .replace(/%20/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const ext = path.extname(base);
  const stem = path.basename(base, ext);
  let candidate = base;
  let i = 2;
  while (used.has(candidate.toLowerCase())) {
    candidate = `${stem}-${i}${ext}`;
    i += 1;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

async function main() {
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  fs.mkdirSync(outDir, { recursive: true });

  const urls = [...new Set(data.assets.filter((asset) => /^https?:\/\//.test(asset)))];
  const used = new Set();
  const manifest = {};

  for (const url of urls) {
    const name = safeName(url, used);
    const local = path.join(outDir, name);
    manifest[url] = `assets/img/${name}`;

    if (fs.existsSync(local) && fs.statSync(local).size > 0) {
      console.log(`cached ${name}`);
      continue;
    }

    console.log(`download ${name}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`skip ${url}: ${res.status}`);
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(local, buffer);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`wrote ${manifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
