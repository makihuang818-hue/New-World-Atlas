import { defineArrayMember, defineField, defineType } from "sanity";

const STATES = ["Washington", "Oregon", "California", "Nevada", "Idaho", "Montana", "Wyoming", "Utah", "Colorado", "Arizona",
  "New Mexico", "North Dakota", "South Dakota", "Nebraska", "Kansas", "Oklahoma", "Texas"];

export const chapter = defineType({
  name: "chapter",
  title: "Chapter",
  type: "document",
  groups: [{ name: "page", title: "Page", default: true }, { name: "map", title: "Home map & menu" }],
  fields: [
    defineField({ name: "number", type: "number", group: "page", validation: r => r.required().integer().positive() }),
    defineField({ name: "title", type: "string", group: "page", validation: r => r.required() }),
    defineField({ name: "slug", type: "slug", group: "page", options: { source: "title" }, validation: r => r.required() }),
    defineField({ name: "state", type: "string", group: "page", options: { list: STATES }, validation: r => r.required() }),
    defineField({ name: "dates", type: "string", group: "page", description: "Shown under the title, e.g. 04.10.2026 ~ 04.21.2026" }),
    defineField({ name: "currentTemperature", type: "string", group: "page", description: "Header tag, e.g. 41.7°" }),
    defineField({
      name: "content", title: "Page content", type: "array", group: "page",
      of: [
        defineArrayMember({ type: "chapterVideo" }),
        defineArrayMember({ type: "chapterText" }),
        defineArrayMember({ type: "chapterLead" }),
        defineArrayMember({ type: "chapterImage" }),
        defineArrayMember({ type: "chapterDiptych" }),
        defineArrayMember({ type: "chapterJournal" }),
        defineArrayMember({ type: "chapterPublication" }),
      ],
    }),
    defineField({ name: "previewImage", type: "image", group: "map", options: { hotspot: true }, description: "Used in the home map card and the chapter menu." }),
    defineField({ name: "cardText", title: "Map card text", type: "text", rows: 3, group: "map" }),
    defineField({
      name: "mapPins", title: "Map tags", type: "array", group: "map",
      description: "Where this chapter's numbered tag sits on the home map. x runs 0 (left) to 1440 (right), y 0 (top) to 899 (bottom). Add two tags if the chapter covers two places.",
      of: [defineArrayMember({
        type: "object", name: "pin",
        fields: [defineField({ name: "x", type: "number", validation: r => r.min(0).max(1440) }), defineField({ name: "y", type: "number", validation: r => r.min(0).max(899) })],
        preview: { select: { x: "x", y: "y" }, prepare: ({ x, y }) => ({ title: `x ${x}, y ${y}` }) },
      })],
    }),
  ],
  orderings: [{ title: "Chapter number", name: "number", by: [{ field: "number", direction: "asc" }] }],
  preview: { select: { n: "number", title: "title", state: "state", media: "previewImage" }, prepare: ({ n, title, state, media }) => ({ title: `${n ?? "?"}. ${title ?? ""}`, subtitle: state, media }) },
});
