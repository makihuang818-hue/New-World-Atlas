import { defineArrayMember, defineField, defineType } from "sanity";

// Content blocks a chapter page is built from, in the order the editor arranges them.

const alt = defineField({ name: "alt", title: "Alt text", type: "string", description: "Describe the image for screen readers." });

export const chapterVideo = defineType({
  name: "chapterVideo",
  title: "Video",
  type: "object",
  fields: [
    defineField({ name: "video", type: "file", options: { accept: "video/mp4" }, validation: r => r.required(), description: "MP4, H.264. Keep it under ~25 MB; it plays muted on loop." }),
    defineField({ name: "poster", title: "Still image", type: "image", description: "Shown while the video loads." }),
    defineField({
      name: "layout", type: "string", initialValue: "wide",
      options: { list: [
        { title: "Wide (under the chapter header, or closing)", value: "wide" },
        { title: "Full width film", value: "film" },
      ], layout: "radio" },
    }),
    defineField({ name: "caption", type: "string" }),
    defineField({ name: "opener", title: "Opening video", type: "boolean", initialValue: false, description: "Sits closer to the chapter header." }),
  ],
  preview: { select: { title: "caption", layout: "layout", media: "poster" }, prepare: ({ title, layout, media }) => ({ title: title || "Video", subtitle: `Video · ${layout}`, media }) },
});

export const chapterText = defineType({
  name: "chapterText",
  title: "Text",
  type: "object",
  fields: [defineField({ name: "body", type: "array", of: [defineArrayMember({ type: "block", styles: [{ title: "Normal", value: "normal" }], lists: [] })] })],
  preview: { select: { body: "body" }, prepare: ({ body }) => ({ title: (body?.[0]?.children?.[0]?.text || "Text").slice(0, 80), subtitle: "Text" }) },
});

export const chapterLead = defineType({
  name: "chapterLead",
  title: "Large text",
  type: "object",
  fields: [defineField({ name: "text", type: "text", rows: 4 })],
  preview: { select: { title: "text" }, prepare: ({ title }) => ({ title: (title || "").slice(0, 80), subtitle: "Large text" }) },
});

export const chapterImage = defineType({
  name: "chapterImage",
  title: "Image",
  type: "object",
  fields: [
    defineField({ name: "image", type: "image", options: { hotspot: true }, validation: r => r.required() }),
    alt,
    defineField({
      name: "layout", type: "string", initialValue: "portrait",
      options: { list: [
        { title: "Portrait (centred column)", value: "portrait" },
        { title: "Full bleed (edge to edge, tall)", value: "fullbleed" },
        { title: "Captioned (wider column)", value: "captioned" },
        { title: "Wide (landscape)", value: "wide" },
      ], layout: "radio" },
    }),
    defineField({ name: "caption", type: "string" }),
  ],
  preview: { select: { media: "image", layout: "layout", caption: "caption" }, prepare: ({ media, layout, caption }) => ({ title: caption || "Image", subtitle: `Image · ${layout}`, media }) },
});

export const chapterDiptych = defineType({
  name: "chapterDiptych",
  title: "Two images",
  type: "object",
  fields: [
    defineField({ name: "left", type: "image", options: { hotspot: true }, validation: r => r.required() }),
    defineField({ name: "right", type: "image", options: { hotspot: true }, validation: r => r.required() }),
  ],
  preview: { select: { media: "left" }, prepare: ({ media }) => ({ title: "Two images", media }) },
});

export const journalEntry = defineType({
  name: "journalEntry",
  title: "Entry",
  type: "object",
  fields: [
    defineField({ name: "time", type: "string", description: "e.g. 7:53 AM" }),
    defineField({ name: "text", type: "text", rows: 2 }),
    defineField({ name: "temperature", type: "string", description: "e.g. 61.2°" }),
    defineField({ name: "elevation", type: "string", description: "e.g. 5225 feet" }),
    defineField({ name: "sky", type: "string", initialValue: "clear", options: { list: [{ title: "Clear skies", value: "clear" }, { title: "Cloudy skies", value: "cloudy" }], layout: "radio" } }),
  ],
  preview: { select: { title: "time", subtitle: "text" } },
});

export const chapterJournal = defineType({
  name: "chapterJournal",
  title: "Field journal",
  type: "object",
  fields: [
    defineField({ name: "date", type: "string", description: "e.g. Wednesday, August 16, 2023" }),
    defineField({ name: "place", type: "string", description: "e.g. Sorensens, California" }),
    defineField({ name: "entries", type: "array", of: [defineArrayMember({ type: "journalEntry" })] }),
    defineField({ name: "video", type: "file", options: { accept: "video/mp4" }, description: "Optional small video beside the timeline." }),
    defineField({ name: "poster", title: "Image (or still for the video)", type: "image" }),
  ],
  preview: { select: { title: "date", subtitle: "place" }, prepare: ({ title, subtitle }) => ({ title: title || "Field journal", subtitle }) },
});

export const chapterPublication = defineType({
  name: "chapterPublication",
  title: "Publication link",
  type: "object",
  fields: [defineField({ name: "publication", type: "reference", to: [{ type: "publication" }], validation: r => r.required() })],
  preview: { select: { title: "publication.title", media: "publication.images.0" }, prepare: ({ title, media }) => ({ title: title || "Publication", subtitle: "Publication link", media }) },
});

export const blockTypes = [chapterVideo, chapterText, chapterLead, chapterImage, chapterDiptych, journalEntry, chapterJournal, chapterPublication];
