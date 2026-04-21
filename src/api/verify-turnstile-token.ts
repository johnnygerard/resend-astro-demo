import { ActionError } from "astro:actions";
import { z } from "zod/mini";
import { parseAndValidateJsonBody } from "~/utils/parse-and-validate-json-body";

// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/#api-response-format
const siteverifySchema = z.required(
  z.partial(
    z.object({
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
        ephemeral_id: z.optional(z.string()), // Enterprise-only field
      }),
    }),
  ),
  { success: true },
);

/**
 * Verify the Cloudflare Turnstile token using the Siteverify API.
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 * @param token - The Turnstile token to verify
 * @param remoteip - The visitor's IP address
 */
export const verifyTurnstileToken = async (
  token: string,
  remoteip: string,
): Promise<void> => {
  let response: Response;

  try {
    response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: import.meta.env.CF_TURNSTILE_SECRET_KEY,
          response: token,
          remoteip,
        }),
        signal: AbortSignal.timeout(5000),
      },
    );
  } catch (e) {
    throw new Error("Fetch request to Siteverify API failed.", { cause: e });
  }

  if (!response.ok)
    throw new Error(
      `Siteverify API request failed with status: ${response.status} ${response.statusText}`,
    );

  const siteverifyResult = await parseAndValidateJsonBody(
    response,
    siteverifySchema,
    "Siteverify API",
  );

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
