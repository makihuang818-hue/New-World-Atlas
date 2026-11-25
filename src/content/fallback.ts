import type { PortableTextBlock } from "next-sanity";
import type { Block, Chapter, ChapterSummary, Img, Publication } from "./types";

// The prototype's placeholder content. The site uses it until a Sanity project is connected, and
// scripts/seed.mjs imports the same content (with the files in public/seed) into Sanity.

const img = (name: string): Img => ({ url: `/seed/${name}.jpg` });
const vid = (name: string) => ({ url: `/seed/${name}.mp4` });
let k = 0;
const key = () => `k${(k++).toString(36)}`;
const pt = (text: string): PortableTextBlock[] => [{ _type: "block", _key: key(), style: "normal", markDefs: [], children: [{ _type: "span", _key: key(), text, marks: [] }] }];

// [number, title, state, map tags]
const CHAPTERS: [number, string, string, [number, number][]][] = [
  [1, "Caldor Fire", "California", [[268, 301]]], [2, "Central Valley", "California", [[263, 446]]],
  [3, "Sierra Smoke", "California", [[295, 381]]], [4, "Klamath", "California", [[234, 272]]],
  [5, "Owens Lake", "California", [[322, 423]]], [6, "Salton Sea", "California", [[335, 518]]],
  [7, "Lake Mead", "Nevada", [[411, 387]]], [8, "Great Salt Lake", "Utah", [[494, 364]]],
  [9, "Moab", "Utah", [[539, 407]]], [10, "Glen Canyon", "Utah", [[492, 446]]],
  [11, "Colorado River", "Arizona", [[451, 508]]], [12, "Painted Desert", "Arizona", [[529, 514]]],
  [13, "Phoenix Heat", "Arizona", [[488, 591]]], [14, "Rio Grande", "New Mexico", [[613, 548]]],
  [15, "White Sands", "New Mexico", [[621, 621], [675, 512]]], [16, "Gila", "New Mexico", [[657, 595]]],
  [17, "Pecos", "New Mexico", [[707, 568]]], [18, "San Luis Valley", "Colorado", [[629, 456]]],
  [19, "Ogallala", "Colorado", [[731, 430]]], [20, "Front Range", "Colorado", [[695, 406]]],
  [21, "Panhandle", "Texas", [[754, 556]]], [22, "Red River", "Texas", [[786, 589]]],
  [23, "Permian Basin", "Texas", [[758, 648]]], [24, "Cross Timbers", "Texas", [[896, 648]]],
  [25, "Brazos", "Texas", [[906, 700]]], [26, "Hill Country", "Texas", [[835, 758]]],
  [27, "Dust Bowl", "Oklahoma", [[860, 572]]], [28, "Cimarron", "Oklahoma", [[931, 532]]],
  [29, "Black Mesa", "Oklahoma", [[867, 515]]], [30, "Flint Hills", "Kansas", [[914, 477]]],
];
const PREVIEWS = ["leaves", "sand", "ferns", "logs", "trunks", "pile", "streaks", "branches", "camap", "streaks2"];
const CARD = "Introductory text lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const fallbackChapters: ChapterSummary[] = CHAPTERS.map(([number, title, state, pins]) => ({
  number, title, state, slug: slugify(title),
  previewImage: img(PREVIEWS[(number - 1) % PREVIEWS.length]),
  cardText: CARD,
  mapPins: pins.map(([x, y]) => ({ x, y })),
}));

export const fallbackPublication: Publication = {
  id: "publication-caldor-fire-signed",
  title: "Caldor Fire (Signed)",
  slug: "caldor-fire-signed",
  price: 20,
  soldOut: false,
  chapterNumber: 1,
  image: img("book"),
  images: [img("book"), img("logs"), img("camap")],
  summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  details: "Held in a large-format folio, Caldor Fire comprises 48 loose pages, double-sided and organized into four poster-size booklets encompassing key images from Black’s journey around the United States. By using two copies of the publication, American Geography Magazine can also function as an pop-up exhibition. Printed in duotone on extra-heavy paper with a wraparound cover.",
  specs: ["Large format publication", "Printed in duotone with matte inks on 150gsm paper", "24 pages", "11.4” x 22.8”", "ISBN: 978-0-578-72616-8", "Signed on the cover"],
};
export const fallbackPublications: Publication[] = [fallbackPublication];

const TEXT = {
  body1: "The Caldor Fire was a large wildfire that burned 221,835 acres (89,773 hectares) in the Eldorado National Forest and other areas of the Sierra Nevada in El Dorado, Amador, and Alpine County, California, in the United States during the 2021 California wildfire season. The fire was first reported on Saturday, August 14, 2021, and was fully contained on Thursday, October 21, 2021. The Caldor Fire destroyed 1,005 structures and damaged 81 more, primarily in the US Highway 50 corridor and in the community of Grizzly Flats, 2/3 of which was destroyed by the fire. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore. Ut enim ad minim veniam, quis nostrud exercitation. Duis aute irure dolor in reprehenderit in voluptate. Excepteur sint occaecat cupidatat non proident.",
  body2: "On August 30, it became the second fire known to cross the Sierra Nevada mountain range, following the Dixie Fire, which crossed a few days earlier on August 18. It then threatened the communities of Meyers and South Lake Tahoe, causing evacuations to be ordered for more than 20,000 people before the fire’s progress was halted. The Caldor Fire was the third-largest and second-most-destructive of the 2021 season in California, and is the seventeenth-largest and sixteenth-most destructive in recorded California history.",
  body3: "The Caldor Fire burned from Saturday, August 14, 2021, to Thursday, October 21, 2021, and consumed 221,835 acres in the Eldorado National Forest in El Dorado, Amador, and Alpine Counties, California.",
  lead: "The U.S. Forest Service determined that the fire was caused by a bullet. A father and son who had called 911 to report the fire were accused of starting it by reckless use of firearms. In January 2024, a judge ruled that there was insufficient evidence to try them.",
  caption: "Image caption lorem ipsum dolor sit amet, consectetur adipiscing elit",
  captionLong: "Image caption lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
};
const JOURNAL: [string, string, string, string, "clear" | "cloudy"][] = [
  ["5:30 AM", "Wake up, Kit Carson camp.", "41.7°", "6920 feet", "cloudy"],
  ["6:12 AM", "Depart, Kit Carson camp. Temperature 41.7°", "44.3°", "6920 feet", "clear"],
  ["7:53 AM", "Bankers Tree. Set up one: hillside.", "61.2°", "5225 feet", "clear"],
  ["10:55 AM", "China Flat. Set up two: rocks and burned trees.", "92.9°", "4686 feet", "clear"],
  ["1:38 PM", "Chimney Flat. Set up three: hillside. Starts to rain again, earlier than yesterday.", "71.0°", "5790 feet", "cloudy"],
  ["2:55 PM", "Lions Creek. Set up four: trees.", "70.2°", "6630 feet", "cloudy"],
  ["4:20 PM", "Back to camp. Light rain, ash on the windshield.", "64.8°", "6920 feet", "cloudy"],
];

// Block order follows the "Chapter — Desktop" frame on the Approved (Dev) Figma page.
export function fallbackContent(): Block[] {
  const image = (name: string, layout: "portrait" | "fullbleed" | "captioned" | "wide", caption?: string): Block => ({ _type: "chapterImage", _key: key(), image: img(name), layout, caption });
  const diptych = (a: string, b: string): Block => ({ _type: "chapterDiptych", _key: key(), left: img(a), right: img(b) });
  const text = (t: string): Block => ({ _type: "chapterText", _key: key(), body: pt(t) });
  return [
    { _type: "chapterVideo", _key: key(), video: vid("caldor"), poster: img("topo"), layout: "wide", opener: true },
    text(TEXT.body1), image("logs", "portrait"), image("streaks2", "fullbleed"),
    text(TEXT.body2), diptych("leaves", "trunks"),
    { _type: "chapterLead", _key: key(), text: TEXT.lead },
    image("camap", "captioned", TEXT.caption),
    text(TEXT.body3), image("pile", "portrait"),
    { _type: "chapterVideo", _key: key(), video: vid("river"), poster: img("waterfall"), layout: "film", caption: TEXT.captionLong },
    image("branches", "fullbleed"), diptych("streaks", "trunks"),
    { _type: "chapterJournal", _key: key(), date: "Wednesday, August 16, 2023", place: "Sorensens, California", video: vid("bts"), poster: img("journal"),
      entries: JOURNAL.map(([time, t, temperature, elevation, sky]) => ({ _key: key(), time, text: t, temperature, elevation, sky })) },
    diptych("ferns", "sand"), image("pile", "fullbleed"), image("leaves", "portrait"),
    { _type: "chapterVideo", _key: key(), video: vid("windy"), poster: img("weather"), layout: "wide" },
    { _type: "chapterPublication", _key: key(), publication: fallbackPublication },
  ];
}

export function fallbackChapter(slug: string): Chapter | null {
  const c = fallbackChapters.find(c => c.slug === slug);
  return c ? { ...c, dates: "04.10.2026 ~ 04.21.2026", currentTemperature: "41.7°", content: fallbackContent() } : null;
}
