import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { company } from "./src/site.ts";

export default defineConfig({
  site: company.url,
  trailingSlash: "never",
  build: { format: "file" },
  integrations: [sitemap({ filter: (page) => !page.endsWith("/404") })],
  devToolbar: { enabled: false },
  server: { port: 5190 },
});
