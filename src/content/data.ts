import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "@/sanity/env";
import { fallbackChapter, fallbackChapters, fallbackPublications } from "./fallback";
import { chapterQuery, chaptersQuery, publicationQuery, publicationsByIdQuery, publicationsQuery } from "./queries";
import type { Chapter, ChapterSummary, Publication, PublicationSummary } from "./types";

const client = isSanityConfigured ? createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: "published" }) : null;

// Every Sanity read is cached and tagged "sanity"; /api/revalidate clears the tag when an editor publishes,
// and the cache refreshes on its own every minute in case that webhook isn't set up.
async function sanityFetch<T>(query: string, params: Record<string, string> = {}): Promise<T> {
  "use cache";
  cacheTag("sanity");
  cacheLife("minutes");
  return client!.fetch<T>(query, params);
}

export const getChapters = async (): Promise<ChapterSummary[]> => (client ? sanityFetch(chaptersQuery) : fallbackChapters);
export const getChapter = async (slug: string): Promise<Chapter | null> => (client ? sanityFetch(chapterQuery, { slug }) : fallbackChapter(slug));
export const getPublications = async (): Promise<PublicationSummary[]> => (client ? sanityFetch(publicationsQuery) : fallbackPublications);
export const getPublication = async (slug: string): Promise<Publication | null> =>
  client ? sanityFetch(publicationQuery, { slug }) : fallbackPublications.find(p => p.slug === slug) ?? null;

// Uncached: checkout must see current prices and stock.
export async function getPublicationsById(ids: string[]): Promise<PublicationSummary[]> {
  if (!client) return fallbackPublications.filter(p => ids.includes(p.id));
  return client.withConfig({ useCdn: false }).fetch<PublicationSummary[]>(publicationsByIdQuery, { ids });
}
