import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";
import { ActionError } from "astro:actions";
import { waitUntil } from "cloudflare:workers";
import { runtimeEnv } from "~/runtime-env";
import { lazy } from "~/utils/lazy";

// The ephemeral (in-memory) cache must remain outside serverless function handlers.
// @see https://upstash.com/docs/redis/sdks/ratelimit-ts/features#caching
const sharedConfig = {
  analytics: true,
  ephemeralCache: new Map<string, number>(),
};

const getRedisClient = lazy(
  () =>
    new Redis({
      url: runtimeEnv.UPSTASH_REDIS_REST_URL,
      token: runtimeEnv.UPSTASH_REDIS_REST_TOKEN,
      enableTelemetry: false,
    }),
);

const getUserRateLimiter = lazy(
  () =>
    new Ratelimit({
      ...sharedConfig,
      limiter: Ratelimit.tokenBucket(
        5, // Refill rate
        "1d", // Refill interval (one day)
        50, // Capacity
      ),
      prefix: "resend-astro-demo:user",
      redis: getRedisClient(),
    }),
);

// This configuration assumes a hypothetical Resend subscriber on the Pro plan
// (50,000 transactional emails included per month).
const getGlobalRateLimiter = lazy(
  () =>
    new Ratelimit({
      ...sharedConfig,
      limiter: Ratelimit.tokenBucket(
        1_500, // Refill rate
        "1d", // Refill interval (one day)
        5_000, // Capacity
      ),
      prefix: "resend-astro-demo:global",
      redis: getRedisClient(),
    }),
);

const rateLimit = async (limiter: Ratelimit, id: string): Promise<void> => {
  const { pending, success } = await limiter.limit(id);

  // Keep Cloudflare worker alive for sending analytics.
  // @see https://upstash.com/docs/redis/sdks/ratelimit-ts/features#asynchronous-synchronization-between-databases
  waitUntil(pending);
  if (success) return;

  throw new ActionError({
    code: "TOO_MANY_REQUESTS",
    message: "Too many requests. Please try again shortly.",
  });
};

/**
 * Rate limit individual users.
 */
export const rateLimitUser = async (id: string): Promise<void> => {
  await rateLimit(getUserRateLimiter(), id);
};

/**
 * Rate limit globally to defend against volumetric attacks and control overall budget.
 */
export const rateLimitGlobally = async (): Promise<void> => {
  await rateLimit(getGlobalRateLimiter(), "global");
};
