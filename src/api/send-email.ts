import { ActionError } from "astro:actions";
import { z } from "zod/mini";
import { ENV } from "~/env";
import { parseAndValidateJsonBody } from "~/utils/parse-and-validate-json-body";

const successResponseSchema = z.object({ id: z.string() });

// https://github.com/resend/resend-node/blob/canary/src/interfaces.ts#L34
const errorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.nullable(z.number()),
  name: z.enum([
    "invalid_idempotency_key",
    "validation_error",
    "missing_api_key",
    "restricted_api_key",
    "invalid_api_key",
    "not_found",
    "method_not_allowed",
    "invalid_idempotent_request",
    "concurrent_idempotent_requests",
    "invalid_attachment",
    "invalid_from_address",
    "invalid_access",
    "invalid_parameter",
    "invalid_region",
    "missing_required_field",
    "monthly_quota_exceeded",
    "daily_quota_exceeded",
    "rate_limit_exceeded",
    "security_error",
    "application_error",
    "internal_server_error",
  ]),
});

/**
 * Send an email using the Resend API.
 * @param body The email payload containing sender, recipient, subject, and text content.
 * @returns The ID of the created email on success.
 * @see https://resend.com/docs/api-reference/emails/send-email
 */
export const sendEmail = async (body: {
  from: string;
  to: string | string[];
  subject: string;
  text: string;
}): Promise<z.infer<typeof successResponseSchema>> => {
  let response: Response;

  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.RESEND_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
  } catch (e) {
    throw new Error("Fetch request to Resend API failed.", { cause: e });
  }

  if (response.ok)
    return await parseAndValidateJsonBody(
      response,
      successResponseSchema,
      "Resend API",
    );

  const error = await parseAndValidateJsonBody(
    response,
    errorResponseSchema,
    "Resend API",
  );

  if (error.statusCode === ActionError.codeToStatus("TOO_MANY_REQUESTS")) {
    console.error("Resend API rate limit or quota exceeded.", error);

    throw new ActionError({
      code: "TOO_MANY_REQUESTS",
      message:
        "Email service is temporarily unavailable. Please try again later.",
    });
  }

  throw new Error("Failed to send email via Resend API.", { cause: error });
};
