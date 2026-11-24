// Writes scripts/seed.ndjson: the prototype's chapters and publication as Sanity documents, with the
// images and videos in public/seed attached as uploads. Import it with:
//   npm run seed && npx sanity dataset import scripts/seed.ndjson production --replace
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fallbackChapters, fallbackContent, fallbackPublications } from "../src/content/fallback.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const local = url => pathToFileURL(join(root, "public", url)).href;
const image = img => (img?.url ? { _type: "image", _sanityAsset: `image@${local(img.url)}` } : undefined);
const file = f => (f?.url ? { _type: "file", _sanityAsset: `file@${local(f.url)}` } : undefined);
const ref = _ref => ({ _type: "reference", _ref });
const slug = current => ({ _type: "slug", current });
const chapterId = s => `chapter-${s}`;

function block(b) {
  const base = { _type: b._type, _key: b._key };
  switch (b._type) {
    case "chapterVideo": return { ...base, video: file(b.video), poster: image(b.poster), layout: b.layout, caption: b.caption, opener: !!b.opener };
    case "chapterText": return { ...base, body: b.body };
    case "chapterLead": return { ...base, text: b.text };
    case "chapterImage": return { ...base, image: image(b.image), layout: b.layout, caption: b.caption };
    case "chapterDiptych": return { ...base, left: image(b.left), right: image(b.right) };
    case "chapterJournal": return { ...base, date: b.date, place: b.place, video: file(b.video), poster: image(b.poster), entries: b.entries.map(e => ({ _type: "journalEntry", ...e })) };
    case "chapterPublication": return { ...base, publication: ref(b.publication.id) };
  }
}

const docs = [];
for (const c of fallbackChapters) {
  docs.push({
    _id: chapterId(c.slug), _type: "chapter",
    number: c.number, title: c.title, slug: slug(c.slug), state: c.state,
    dates: "04.10.2026 ~ 04.21.2026", currentTemperature: "41.7°",
    previewImage: image(c.previewImage), cardText: c.cardText,
    mapPins: c.mapPins.map((p, i) => ({ _type: "pin", _key: `pin${i}`, x: p.x, y: p.y })),
    content: fallbackContent().map(block),
  });
}
fallbackPublications.forEach((p, i) => {
  docs.push({
    _id: p.id, _type: "publication",
    title: p.title, slug: slug(p.slug), price: p.price, soldOut: p.soldOut, order: i + 1,
    chapter: p.chapterNumber ? ref(chapterId(fallbackChapters.find(c => c.number === p.chapterNumber).slug)) : undefined,
    images: p.images.map((im, k) => ({ _key: `img${k}`, ...image(im) })),
    summary: p.summary, details: p.details, specs: p.specs,
  });
});

const out = join(root, "scripts", "seed.ndjson");
writeFileSync(out, docs.map(d => JSON.stringify(d)).join("\n") + "\n");
console.log(`Wrote ${docs.length} documents to ${out}`);
