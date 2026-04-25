import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";
import { runtimeEnv } from "~/runtime-env";

const sharedConfig = {
  analytics: true,
  redis: new Redis({
    url: runtimeEnv.UPSTASH_REDIS_REST_URL,
    token: runtimeEnv.UPSTASH_REDIS_REST_TOKEN,
    enableTelemetry: false,
  }),
};

/**
 * Rate limiters for the contact form POST endpoint.
 *
 * The following configuration assumes a hypothetical Resend subscriber on the
 * Pro plan (50,000 transactional emails included per month).
 */
export const rateLimiters = {
  // Rate limiter for individual users.
  user: new Ratelimit({
    ...sharedConfig,
    limiter: Ratelimit.tokenBucket(
      5, // Refill rate
      "1d", // Refill interval (one day)
      50, // Capacity
    ),
    prefix: "resend-astro-demo:user",
  }),
  // The global limiter defends against volumetric attacks and controls overall budget.
  global: new Ratelimit({
    ...sharedConfig,
    limiter: Ratelimit.tokenBucket(
      1_500, // Refill rate
      "1d", // Refill interval (one day)
      5_000, // Capacity
    ),
    prefix: "resend-astro-demo:global",
  }),
};
