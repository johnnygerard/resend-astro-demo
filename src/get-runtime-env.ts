import { env } from "cloudflare:workers";
import { z } from "zod/mini";
import { lazy } from "~/utils/lazy";

const schema = (name: string) =>
  z.string(`Runtime variable ${name} must be a string`);

export const getRuntimeEnv = lazy(() =>
  z
    .looseObject({
      RESEND_API_KEY: schema("RESEND_API_KEY"),
      CF_TURNSTILE_SECRET_KEY: schema("CF_TURNSTILE_SECRET_KEY"),
      EMAIL_RECIPIENT: schema("EMAIL_RECIPIENT"),
      EMAIL_SENDER: schema("EMAIL_SENDER"),
      UPSTASH_REDIS_REST_URL: schema("UPSTASH_REDIS_REST_URL"),
      UPSTASH_REDIS_REST_TOKEN: schema("UPSTASH_REDIS_REST_TOKEN"),
    })
    .parse(env),
);
