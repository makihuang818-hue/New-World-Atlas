// Sanity connection settings, read from .env.local (see .env.example).
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2026-11-01";

// Until a Sanity project is connected, the site renders the prototype's content from src/content/fallback.ts.
export const isSanityConfigured = projectId.length > 0;
