// Allow importing Astro components in TypeScript files without causing errors.
declare module "*.astro";

// https://docs.astro.build/en/guides/environment-variables/#intellisense-for-typescript
interface ImportMetaEnv {
  readonly CF_TURNSTILE_SECRET_KEY: string;
  readonly PUBLIC_CF_TURNSTILE_SITEKEY: string;
  readonly RESEND_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
