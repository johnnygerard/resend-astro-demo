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
 */
export const verifyTurnstileToken = async (token: string): Promise<void> => {
  let siteverifyResponse: Response;

  try {
    siteverifyResponse = await fetch(
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
  } catch (e) {
    throw new Error("Fetch request to Siteverify API failed.", { cause: e });
  }

  if (!siteverifyResponse.ok)
    throw new Error(
      `Siteverify API request failed with status: ${siteverifyResponse.status} ${siteverifyResponse.statusText}`,
    );

  let siteverifyResult: z.infer<typeof siteverifySchema>;

  try {
    siteverifyResult = siteverifySchema.parse(await siteverifyResponse.json());
  } catch (e) {
    throw new Error(
      e instanceof z.ZodError
        ? "Siteverify API response failed schema validation."
        : "Unable to parse JSON payload from Siteverify API response.",
      { cause: e },
    );
  }

  if (siteverifyResult.success) return;

  const errorCodes = siteverifyResult["error-codes"];
  if (!errorCodes?.[0])
    throw new Error(
      "No error codes provided in failed Siteverify API response.",
    );

  // Handle fatal errors.
  if (
    errorCodes.includes("missing-input-secret") ||
    errorCodes.includes("invalid-input-secret") ||
    errorCodes.includes("missing-input-response") ||
    errorCodes.includes("bad-request") ||
    errorCodes.includes("internal-error")
  ) {
    console.error(
      "Siteverify API validation failed with error codes:",
      errorCodes,
    );

    throw new ActionError({
      code: errorCodes.includes("bad-request")
        ? "BAD_REQUEST"
        : "INTERNAL_SERVER_ERROR",
      message:
        "An error occurred during security challenge verification. Please try again later.",
    });
  }

  console.info(
    "Security challenge failed (error codes: %s).",
    errorCodes.join(", "),
  );

  throw new ActionError({
    code: "FORBIDDEN",
    message: "Security challenge failed. Please try again.",
  });
};
