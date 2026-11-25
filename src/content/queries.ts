import { defineQuery } from "next-sanity";

const IMG = `{ "url": asset->url, "w": asset->metadata.dimensions.width, "h": asset->metadata.dimensions.height }`;
const PUB_SUMMARY = `{ "id": _id, title, "slug": slug.current, price, "soldOut": coalesce(soldOut, false), "chapterNumber": chapter->number, "image": images[0]${IMG} }`;
const CHAPTER_SUMMARY = `{ number, title, "slug": slug.current, state, "previewImage": previewImage${IMG}, cardText, "mapPins": coalesce(mapPins[]{ x, y }, []) }`;

export const chaptersQuery = defineQuery(`*[_type == "chapter" && defined(slug.current)] | order(number asc) ${CHAPTER_SUMMARY}`);

export const chapterQuery = defineQuery(`*[_type == "chapter" && slug.current == $slug][0]{
  number, title, "slug": slug.current, state, dates, currentTemperature,
  "previewImage": previewImage${IMG}, cardText, "mapPins": coalesce(mapPins[]{ x, y }, []),
  "content": coalesce(content[]{
    _type, _key,
    _type == "chapterVideo" => { "video": video{ "url": asset->url }, "poster": poster${IMG}, layout, caption, opener },
    _type == "chapterText" => { body },
    _type == "chapterLead" => { text },
    _type == "chapterImage" => { "image": image{ "url": asset->url, "w": asset->metadata.dimensions.width, "h": asset->metadata.dimensions.height, "alt": ^.alt }, layout, caption },
    _type == "chapterDiptych" => { "left": left${IMG}, "right": right${IMG} },
    _type == "chapterJournal" => { date, place, entries[]{ _key, time, text, temperature, elevation, sky }, "video": video{ "url": asset->url }, "poster": poster${IMG} },
    _type == "chapterPublication" => { "publication": publication->${PUB_SUMMARY} }
  }, [])
}`);

export const publicationsQuery = defineQuery(`*[_type == "publication" && defined(slug.current)] | order(coalesce(order, 999) asc, _createdAt asc) ${PUB_SUMMARY}`);

export const publicationQuery = defineQuery(`*[_type == "publication" && slug.current == $slug][0]{
  "id": _id, title, "slug": slug.current, price, "soldOut": coalesce(soldOut, false), "chapterNumber": chapter->number,
  "image": images[0]${IMG}, "images": coalesce(images[]${IMG}, []), summary, details, specs
}`);

// Checkout reads prices fresh from the CMS, never from the browser.
export const publicationsByIdQuery = defineQuery(`*[_type == "publication" && _id in $ids]${PUB_SUMMARY}`);
