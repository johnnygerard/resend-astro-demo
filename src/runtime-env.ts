import { env } from "cloudflare:workers";

const get = (
  name:
    | "RESEND_API_KEY"
    | "CF_TURNSTILE_SECRET_KEY"
    | "EMAIL_RECIPIENT"
    | "EMAIL_SENDER",
): string => {
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
};
