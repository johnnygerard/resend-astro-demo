import { z } from "astro/zod";
import { ActionError } from "astro:actions";
import { type CreateEmailResponseSuccess, type ErrorResponse } from "resend";

const successResponseSchema = z.object({ id: z.string() });

// https://github.com/resend/resend-node/blob/canary/src/interfaces.ts#L34
const errorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number().nullable(),
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

const parseAndValidateJsonBody = async <T extends z.ZodType>(
  response: Response,
  schema: T,
): Promise<z.infer<T>> => {
  let value: unknown;

  try {
    value = await response.json();
  } catch (e) {
    throw new Error("Unable to parse JSON payload from Resend API.", {
      cause: e,
    });
  }

  const { success, data, error } = schema.safeParse(value);
  if (success) return data;
  throw new Error("Invalid JSON payload from Resend API", { cause: error });
};

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
}): Promise<CreateEmailResponseSuccess> => {
  let response: Response;

  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
  } catch (e) {
    throw new Error("Fetch request to Resend API failed.", { cause: e });
  }

  if (response.ok)
    return await parseAndValidateJsonBody(response, successResponseSchema);

  const error: ErrorResponse = await parseAndValidateJsonBody(
    response,
    errorResponseSchema,
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
