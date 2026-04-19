import { ActionError } from "astro:actions";
import {
  Resend,
  type CreateEmailOptions,
  type CreateEmailResponseSuccess,
} from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const sendEmail = async (
  payload: CreateEmailOptions,
): Promise<CreateEmailResponseSuccess> => {
  const { data, error } = await resend.emails.send(payload);
  if (!error) return data;

  // https://resend.com/docs/api-reference/errors
  if (
    error.name === "monthly_quota_exceeded" ||
    error.name === "daily_quota_exceeded" ||
    error.name === "rate_limit_exceeded"
  ) {
    console.error("Resend API rate limit or quota exceeded:", error);

    throw new ActionError({
      code: "TOO_MANY_REQUESTS",
      message:
        "Email service is temporarily unavailable. Please try again later.",
    });
  }

  throw new Error(
    `Resend API error: ${error.name} (${error.statusCode}): ${error.message}`,
  );
};
