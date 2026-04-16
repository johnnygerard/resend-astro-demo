import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField, fontProviders } from "astro/config";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  adapter: cloudflare(),
  build: {
    format: "file",
  },
  env: {
    schema: {
      CF_TURNSTILE_SECRET_KEY: envField.string({
        access: "secret",
        context: "server",
      }),
      CF_TURNSTILE_SITEKEY: envField.string({
        access: "public",
        context: "client",
      }),
      RESEND_API_KEY: envField.string({
        access: "secret",
        context: "server",
      }),
      TARGET_EMAIL: envField.string({
        access: "secret",
        context: "server",
        default: "delivered@resend.dev", // @see https://resend.com/docs/dashboard/emails/send-test-emails
      }),
    },
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
