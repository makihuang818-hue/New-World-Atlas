"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "new-world-atlas",
  title: "New World Atlas",
  basePath: "/studio",
  projectId: projectId || "not-configured",
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: S =>
        S.list().title("Content").items([
          S.documentTypeListItem("chapter").title("Chapters").child(S.documentTypeList("chapter").defaultOrdering([{ field: "number", direction: "asc" }])),
          S.documentTypeListItem("publication").title("Publications").child(S.documentTypeList("publication").defaultOrdering([{ field: "order", direction: "asc" }])),
        ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
