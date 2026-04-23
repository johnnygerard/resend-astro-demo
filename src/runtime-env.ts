import { env } from "cloudflare:workers";

const getEnvVariable = (name: keyof Cloudflare.Env): string => {
  const value = env[name];

  if (typeof value === "string") {
    if (/\S/.test(value)) {
      // Replace getter with a readonly property to avoid repeated validation on subsequent accesses.
      Object.defineProperty(runtimeEnv, name, { enumerable: true, value });
      return value;
    }

    throw new Error(
      `Environment variable ${name} cannot be ${value === "" ? "an empty string" : "a string with only whitespace"}.`,
    );
  }

  if (value === undefined)
    throw new Error(`Missing environment variable: ${name}`);

  throw new TypeError(
    `Unexpected type for environment variable ${name}: ${typeof value}`,
  );
};

export const runtimeEnv = {
  get RESEND_API_KEY(): string {
    return getEnvVariable("RESEND_API_KEY");
  },

  get CF_TURNSTILE_SECRET_KEY(): string {
    return getEnvVariable("CF_TURNSTILE_SECRET_KEY");
  },

  get EMAIL_RECIPIENT(): string {
    return getEnvVariable("EMAIL_RECIPIENT");
  },

  get EMAIL_SENDER(): string {
    return getEnvVariable("EMAIL_SENDER");
  },
};
