// Allow importing Astro components in TypeScript files without causing errors.
declare module "*.astro";

interface Window {
  turnstile?: {
    getResponse: (cssSelector: string) => string | undefined;
    reset: (cssSelector: string) => void;
  };
}
