import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL) => `\
# https://www.rfc-editor.org/rfc/rfc9309
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(getRobotsTxt(sitemapURL));
};
