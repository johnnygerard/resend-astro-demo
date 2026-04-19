import { z } from "astro/zod";
import { ActionError } from "astro:actions";

// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/#api-response-format
const siteverifySchema = z
  .object({
    success: z.boolean(),
    challenge_ts: z.string(),
    hostname: z.string(),
    "error-codes": z.array(
      z.enum([
        "missing-input-secret",
        "invalid-input-secret",
        "missing-input-response",
        "invalid-input-response",
        "bad-request",
        "timeout-or-duplicate",
        "internal-error",
      ]),
    ),
    action: z.string(),
    cdata: z.string(),
    metadata: z.object({
      ephemeral_id: z.string().optional(), // Enterprise-only field
    }),
  })
  .partial()
  .required({ success: true });

/**
 * Verify the Cloudflare Turnstile token using the Siteverify API.
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 * @param token - The Turnstile token to verify
 * @throws {ActionError} Throws an ActionError if the token is missing, invalid, or if the Siteverify API request fails.
 */
export const verifyTurnstileToken = async (token: string): Promise<void> => {
  const siteverifyResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: import.meta.env.CF_TURNSTILE_SECRET_KEY,
        response: token,
      }),
      signal: AbortSignal.timeout(5000),
    },
  );

  if (!siteverifyResponse.ok) {
    console.error(
      "Siteverify API request failed with status:",
      siteverifyResponse.status,
    );
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "An unexpected error occurred during CAPTCHA verification. Please try again.",
    });
  }

  const siteverifyResult = siteverifySchema.parse(
    await siteverifyResponse.json(),
  );

  if (!siteverifyResult.success) {
    throw new ActionError({
      code: "FORBIDDEN",
      message: "CAPTCHA verification failed. Please try again.",
    });
  }
};
