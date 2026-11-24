import { defineCliConfig } from "sanity/cli";

// The Sanity CLI only reads SANITY_STUDIO_* variables by itself, so load the Next.js env file too.
try { process.loadEnvFile(".env.local"); } catch {}

// Lets `npx sanity …` commands (login, dataset import, CORS) find the project.
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  },
});
