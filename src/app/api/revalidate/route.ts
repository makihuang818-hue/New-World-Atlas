import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

// Sanity calls this (via a GROQ webhook) whenever content is published, so the site updates within seconds.
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return Response.json({ error: "SANITY_REVALIDATE_SECRET is not set" }, { status: 500 });
  const { isValidSignature } = await parseBody(request, secret, true);
  if (!isValidSignature) return Response.json({ error: "Invalid signature" }, { status: 401 });
  revalidateTag("sanity", "max");
  return Response.json({ revalidated: true });
}
