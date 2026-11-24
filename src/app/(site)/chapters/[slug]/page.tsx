import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChapterBlock, ChapterHeader, NextChapter } from "@/components/chapter/Blocks";
import { getChapter, getChapters } from "@/content/data";

// Prerender every chapter; new ones from the CMS render on first visit. Cache Components needs at least one param.
export async function generateStaticParams() {
  const chapters = await getChapters();
  return chapters.length ? chapters.map(c => ({ slug: c.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/chapters/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const chapter = await getChapter(slug);
  return chapter ? { title: `Chapter ${chapter.number}: ${chapter.title}`, description: chapter.cardText ?? undefined } : {};
}

// The page shell (dark background) shows at once on navigation; the chapter streams in.
export default function ChapterPage({ params }: PageProps<"/chapters/[slug]">) {
  return (
    <main className="page chapter">
      <Suspense fallback={null}><Chapter params={params} /></Suspense>
    </main>
  );
}

async function Chapter({ params }: Pick<PageProps<"/chapters/[slug]">, "params">) {
  const { slug } = await params;
  const [chapter, chapters] = await Promise.all([getChapter(slug), getChapters()]);
  if (!chapter) notFound();
  const i = chapters.findIndex(c => c.slug === slug);
  const next = chapters.length > 1 ? chapters[(i + 1) % chapters.length] : null;

  return (
    <>
      <ChapterHeader chapter={chapter} />
      {chapter.content.map(block => <ChapterBlock key={block._key} block={block} />)}
      {next && <NextChapter chapter={next} />}
    </>
  );
}
