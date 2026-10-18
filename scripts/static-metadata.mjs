import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { SITE_URL, SITE_NAME, knownPaths, getSeoData } from "../src/seo.ts";
const template = await readFile("dist/index.html", "utf8");
const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
function page(path, known = true) {
  const seo = getSeoData(path);
  const url = SITE_URL + path;
  const head = `<title>${escape(seo.title)}</title>
<meta name="description" content="${escape(seo.description)}">
<meta name="robots" content="${known ? "index, follow" : "noindex, follow"}">
<link rel="canonical" href="${escape(url)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${escape(seo.title)}">
<meta property="og:description" content="${escape(seo.description)}">
<meta property="og:url" content="${escape(url)}">
<meta property="og:image" content="${SITE_URL}/social-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Merchant Listing Preflight: local CSV and Product / Offer checks">
<meta name="twitter:image" content="${SITE_URL}/social-card.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escape(seo.title)}">
<meta name="twitter:description" content="${escape(seo.description)}">`;
  return template
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(
      /<meta\s+(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/g,
      "",
    )
    .replace(/<link\s+rel="canonical"[^>]*>/g, "")
    .replace("</head>", head + "\n</head>");
}
for (const path of knownPaths) {
  const target = path === "/" ? "dist/index.html" : `dist${path}.html`;
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, page(path));
}
await writeFile("dist/404.html", page("/404", false));
console.log(`Static metadata: ${knownPaths.length} routes + noindex 404`);
