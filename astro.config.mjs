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
  // Note that this environment configuration is only used for client-side variables.
  env: {
    schema: {
      CF_TURNSTILE_SITEKEY: envField.string({
        access: "public",
        context: "client",
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
  session: {
    /**
     * Disable SESSION KV binding automatic provisioning
     *
     * This driver overrides the default driver from the Cloudflare adapter.
     * @see https://unstorage.unjs.io/
     * @see https://github.com/withastro/astro/pull/15803
     */
    driver: {
      entrypoint: "unstorage/drivers/null",
    },
  },
  site: "https://resend-astro-demo.jgerard.dev",
  trailingSlash: "never",
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      optimizeDeps: {
        exclude: [
          "astro/actions/runtime/entrypoints/server.js",
          "@phosphor-icons/react",
        ],
      },
    },
  },
});
