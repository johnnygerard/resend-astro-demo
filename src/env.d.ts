// Allow importing Astro components in TypeScript files without causing errors.
declare module "*.astro";

interface Window {
  turnstile?: {
    reset: (cssSelector: string) => void;
  };
}
