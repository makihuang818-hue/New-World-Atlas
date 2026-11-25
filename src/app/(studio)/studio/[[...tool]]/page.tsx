import { NextStudio } from "next-sanity/studio";
import { isSanityConfigured } from "@/sanity/env";
import config from "../../../../../sanity.config";

export { metadata, viewport } from "next-sanity/studio";

// The Studio is a client-side app; one prerendered shell serves every /studio/... URL.
export function generateStaticParams() {
  return [{ tool: [] }];
}

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main style={{ font: "16px/1.5 system-ui, sans-serif", maxWidth: 560, margin: "80px auto", padding: "0 24px" }}>
        <h1 style={{ fontSize: 22 }}>Sanity isn’t connected yet</h1>
        <p>Add <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> to <code>.env.local</code> (see SETUP.md), then restart the dev server.</p>
      </main>
    );
  }
  return <NextStudio config={config} />;
}
