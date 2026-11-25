import { defineArrayMember, defineField, defineType } from "sanity";

export const publication = defineType({
  name: "publication",
  title: "Publication",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: r => r.required(), description: "e.g. Caldor Fire (Signed)" }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: r => r.required() }),
    defineField({ name: "chapter", type: "reference", to: [{ type: "chapter" }], description: "Shown as “Chapter N” before the title." }),
    defineField({ name: "price", title: "Price (USD)", type: "number", validation: r => r.required().min(0.5).precision(2) }),
    defineField({ name: "soldOut", title: "Sold out", type: "boolean", initialValue: false }),
    defineField({ name: "images", type: "array", of: [defineArrayMember({ type: "image", options: { hotspot: true } })], validation: r => r.min(1) }),
    defineField({ name: "summary", type: "text", rows: 5, description: "The paragraph under the price." }),
    defineField({ name: "details", type: "text", rows: 5, description: "The paragraph under DETAIL." }),
    defineField({ name: "specs", type: "array", of: [defineArrayMember({ type: "string" })], description: "Bulleted list, e.g. 24 pages, ISBN…" }),
    defineField({ name: "order", title: "Sort order", type: "number", description: "Lower numbers come first in lists." }),
  ],
  orderings: [{ title: "Sort order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", price: "price", n: "chapter.number", media: "images.0" }, prepare: ({ title, price, n, media }) => ({ title, subtitle: `${n ? `Chapter ${n} · ` : ""}$${price ?? "—"}`, media }) },
});
