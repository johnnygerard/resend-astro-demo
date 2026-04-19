import { z } from "astro/zod";
import { ActionError } from "astro:actions";

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

  const siteverifyResult = z
    .looseObject({ success: z.boolean() })
    .parse(await siteverifyResponse.json());

  if (!siteverifyResult.success) {
    throw new ActionError({
      code: "FORBIDDEN",
      message: "CAPTCHA verification failed. Please try again.",
    });
  }
};
