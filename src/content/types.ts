import type { PortableTextBlock } from "next-sanity";

// Shapes the pages render. Sanity queries (queries.ts) and the fallback content (fallback.ts) both produce these.

export type Img = { url: string; alt?: string | null; w?: number | null; h?: number | null };
export type FileRef = { url: string };

export type ChapterSummary = {
  number: number;
  title: string;
  slug: string;
  state: string;
  previewImage?: Img | null;
  cardText?: string | null;
  mapPins: { x: number; y: number }[];
};

export type PublicationSummary = {
  id: string;
  title: string;
  slug: string;
  price: number;
  soldOut: boolean;
  chapterNumber?: number | null;
  image?: Img | null;
};

export type Publication = PublicationSummary & {
  images: Img[];
  summary?: string | null;
  details?: string | null;
  specs?: string[] | null;
};

export type JournalEntry = { _key: string; time?: string; text?: string; temperature?: string; elevation?: string; sky?: "clear" | "cloudy" };

export type Block =
  | { _type: "chapterVideo"; _key: string; video?: FileRef | null; poster?: Img | null; layout?: "wide" | "film"; caption?: string | null; opener?: boolean }
  | { _type: "chapterText"; _key: string; body?: PortableTextBlock[] }
  | { _type: "chapterLead"; _key: string; text?: string }
  | { _type: "chapterImage"; _key: string; image?: Img | null; layout?: "portrait" | "fullbleed" | "captioned" | "wide"; caption?: string | null }
  | { _type: "chapterDiptych"; _key: string; left?: Img | null; right?: Img | null }
  | { _type: "chapterJournal"; _key: string; date?: string; place?: string; entries?: JournalEntry[]; video?: FileRef | null; poster?: Img | null }
  | { _type: "chapterPublication"; _key: string; publication?: PublicationSummary | null };

export type Chapter = ChapterSummary & {
  dates?: string | null;
  currentTemperature?: string | null;
  content: Block[];
};
