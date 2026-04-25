import { env } from "cloudflare:workers";

const get = (name: keyof typeof runtimeEnv): string => {
  const value = env[name];
  if (typeof value === "string") return value;

  throw new TypeError(
    `Expected environment variable ${name} to be a string, but got ${typeof value}`,
  );
};

export const runtimeEnv = {
  get RESEND_API_KEY(): string {
    return get("RESEND_API_KEY");
  },

  get CF_TURNSTILE_SECRET_KEY(): string {
    return get("CF_TURNSTILE_SECRET_KEY");
  },

  get EMAIL_RECIPIENT(): string {
    return get("EMAIL_RECIPIENT");
  },

  get EMAIL_SENDER(): string {
    return get("EMAIL_SENDER");
  },

  get UPSTASH_REDIS_REST_URL(): string {
    return get("UPSTASH_REDIS_REST_URL");
  },

  get UPSTASH_REDIS_REST_TOKEN(): string {
    return get("UPSTASH_REDIS_REST_TOKEN");
  },
};
