import Link from "next/link";
import { PortableText } from "next-sanity";
import { AutoVideo } from "@/components/AutoVideo";
import { JournalTrack } from "@/components/bits";
import { chapterLabel, src } from "@/content/format";
import type { Block, Chapter, ChapterSummary, Img } from "@/content/types";

const ICONS = { thermo: "/icons/thermo.svg", elev: "/icons/elev.svg", cloud: "/icons/cloud.svg", sun: "/icons/sun.svg" };
const Tag = ({ icon, children }: { icon: keyof typeof ICONS; children: React.ReactNode }) => (
  <span className="tag"><img src={ICONS[icon]} alt="" />{children}</span>
);
const Picture = ({ image, width, alt }: { image?: Img | null; width: number; alt?: string }) =>
  image ? <img src={src(image, width)} alt={alt ?? image.alt ?? ""} loading="lazy" /> : null;

export function ChapterHeader({ chapter }: { chapter: Chapter }) {
  return (
    <header className="ch-block ch-header">
      <div className="ch-header__heading reveal">
        <p className="ch-kicker">Chapter {chapter.number}</p>
        <h1 className="ch-title">{chapter.title}</h1>
      </div>
      <div className="ch-header__meta">
        <div>{chapter.currentTemperature && <Tag icon="thermo">Currently&nbsp;&nbsp;{chapter.currentTemperature}</Tag>}</div>
        <div className="ch-header__date">{chapter.dates}</div>
        <div className="ch-header__map" aria-label={`Location: ${chapter.state}`}>
          <img src="/map/minimap.svg" alt="" />
          <svg className="ch-header__pin" viewBox="0 0 17 34" aria-hidden="true"><circle cx="8.5" cy="8.5" r="8" fill="#bbb" /><path d="M8.5 16v18" stroke="#bbb" /></svg>
        </div>
      </div>
    </header>
  );
}

// One component per block type in the Sanity schema (src/sanity/schemaTypes/blocks.ts).
export function ChapterBlock({ block }: { block: Block }) {
  switch (block._type) {
    case "chapterVideo": {
      if (!block.video?.url) return null;
      const poster = src(block.poster, 1800);
      if (block.layout === "film") {
        return (
          <section className="ch-block ch-pad-120">
            <figure style={{ margin: 0 }}>
              <AutoVideo className="ch-media ratio-1440x812 reveal" src={block.video.url} poster={poster} label={block.caption ?? undefined} />
              {block.caption && <figcaption className="ch-caption ch-film__cap">{block.caption}</figcaption>}
            </figure>
          </section>
        );
      }
      return (
        <section className={`ch-block ${block.opener ? "ch-pad-80 ch-opener" : "ch-pad-100"}`}>
          <AutoVideo className="ch-wide ch-media ratio-1379x776 reveal" src={block.video.url} poster={poster} label={block.caption ?? undefined} />
          {block.caption && <p className="ch-wide ch-caption">{block.caption}</p>}
        </section>
      );
    }
    case "chapterText":
      return <section className="ch-block ch-pad-120"><div className="ch-col ch-text reveal"><PortableText value={block.body ?? []} /></div></section>;
    case "chapterLead":
      return <section className="ch-block ch-pad-64"><p className="ch-col ch-col--762 ch-lead reveal">{block.text}</p></section>;
    case "chapterImage": {
      const { image, caption } = block;
      switch (block.layout) {
        case "fullbleed":
          return <section className="ch-block ch-pad-120"><div className="ch-media ratio-1440x1800 reveal"><Picture image={image} width={2400} /></div></section>;
        case "captioned":
          return (
            <section className="ch-block ch-pad-120">
              <figure className="ch-col ch-col--762" style={{ marginBlock: 0 }}>
                <div className="ch-media ratio-762x881 reveal"><Picture image={image} width={1600} /></div>
                {caption && <figcaption className="ch-caption">{caption}</figcaption>}
              </figure>
            </section>
          );
        case "wide":
          return (
            <section className="ch-block ch-pad-100">
              <div className="ch-wide ch-media ratio-1379x776 reveal"><Picture image={image} width={2400} /></div>
              {caption && <p className="ch-wide ch-caption">{caption}</p>}
            </section>
          );
        default:
          return (
            <section className="ch-block ch-pad-120">
              <div className="ch-col ch-media ratio-608x760 reveal"><Picture image={image} width={1300} /></div>
              {caption && <p className="ch-col ch-caption">{caption}</p>}
            </section>
          );
      }
    }
    case "chapterDiptych":
      return (
        <section className="ch-block ch-pad-120">
          <div className="ch-diptych">
            <div className="ch-media ratio-628x767 reveal"><Picture image={block.left} width={1300} /></div>
            <div className="ch-media ratio-628x767 reveal" style={{ transitionDelay: ".12s" }}><Picture image={block.right} width={1300} /></div>
          </div>
        </section>
      );
    case "chapterJournal":
      return (
        <section className="ch-block journal">
          <JournalTrack date={block.date} place={block.place}>
            {(block.entries ?? []).map(e => (
              <div key={e._key} className="entry">
                <span className="entry__time">{e.time}</span><span className="entry__dot" />
                <p className="entry__text">{e.text}</p>
                <div className="entry__tags">
                  {e.temperature && <Tag icon="thermo">{e.temperature}</Tag>}
                  {e.elevation && <Tag icon="elev">{e.elevation}</Tag>}
                  <Tag icon={e.sky === "cloudy" ? "cloud" : "sun"}>{e.sky === "cloudy" ? "Cloudy skies" : "Clear skies"}</Tag>
                </div>
              </div>
            ))}
          </JournalTrack>
          {block.video?.url ? (
            <AutoVideo className="journal__photo ch-media reveal" src={block.video.url} poster={src(block.poster, 1000)} />
          ) : block.poster ? (
            <div className="journal__photo ch-media reveal"><Picture image={block.poster} width={1000} /></div>
          ) : null}
        </section>
      );
    case "chapterPublication": {
      const p = block.publication;
      if (!p) return null;
      return (
        <section className="ch-block ch-pub">
          <Link className="pubcard reveal" href={`/publications/${p.slug}`}>
            <span className="pubcard__img"><Picture image={p.image} width={500} /></span>
            <span className="pubcard__meta">
              {chapterLabel(p.chapterNumber)}<b>{p.title}</b>
              <svg className="pubcard__arrow" viewBox="0 0 42 10" aria-hidden="true"><path d="M0 5h41M37 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth=".8" /></svg>
            </span>
          </Link>
        </section>
      );
    }
    default:
      return null;
  }
}

export function NextChapter({ chapter }: { chapter: ChapterSummary }) {
  return (
    <Link className="ch-block next" href={`/chapters/${chapter.slug}`}>
      <p className="ch-kicker" style={{ fontSize: 14 }}>Chapter {chapter.number}</p>
      <p className="ch-title" style={{ marginTop: 20 }}>{chapter.title}</p>
    </Link>
  );
}
