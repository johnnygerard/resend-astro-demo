import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  adapter: cloudflare(),
  build: {
    format: "file",
  },
  fonts: [
    // Geist: sans-serif typeface
    // @see https://fonts.google.com/specimen/Geist/about
    {
      cssVariable: "--font-geist",
      name: "Geist",
      provider: fontProviders.google(),
      styles: ["normal", "italic"],
      subsets: ["latin"],
      weights: ["100 900"],
    },
  ],
  integrations: [react(), sitemap()],
  output: "server",
  site: "https://resend.jgerard.dev",
  trailingSlash: "never",
  vite: {
    plugins: [tailwindcss()],
  },
});
