import { v4 as uuid } from "@lukeed/uuid";
import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";
import {
  CF_TURNSTILE_SECRET_KEY,
  RESEND_API_KEY,
  TARGET_EMAIL,
} from "astro:env/server";
import { Resend, type CreateEmailResponseSuccess } from "resend";
import {
  EMAIL_MAX_LENGTH,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
  validationMessages,
} from "~/validation/messages";

const resend = new Resend(RESEND_API_KEY);

export const server = {
  // The following server action will be used with a basic contact form.
  send: defineAction({
    accept: "form",
    input: z.object({
      website: z.string().optional(),
      name: z
        .string()
        .trim()
        .min(1, validationMessages.name.valueMissing)
        .max(NAME_MAX_LENGTH, validationMessages.name.tooLong),
      email: z
        .string()
        .trim()
        .min(1, validationMessages.email.valueMissing)
        .max(EMAIL_MAX_LENGTH, validationMessages.email.tooLong)
        .check(z.email(validationMessages.email.typeMismatch)),
      message: z
        .string()
        .trim()
        .min(1, validationMessages.message.valueMissing)
        .max(MESSAGE_MAX_LENGTH, validationMessages.message.tooLong),
      "cf-turnstile-response": z
        .string()
        .min(1, "Turnstile verification is required."),
    }),
    handler: async (input) => {
      if (input.website?.length) {
        console.log("Received non-empty honeypot field.");
        return { id: uuid() } as CreateEmailResponseSuccess;
      }

      // Validate Turnstile token with Siteverify API (https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
      const siteverifyResponse = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: CF_TURNSTILE_SECRET_KEY,
            response: input["cf-turnstile-response"],
          }),
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

      const { data, error } = await resend.emails.send({
        from: `John <hello@resend.jgerard.dev>`,
        to: TARGET_EMAIL,
        subject: `New message from ${input.name} (${input.email})`,
        text: input.message,
      });

      if (error) {
        console.error(
          `Failed to send email (type: ${error.name}, status: ${error.statusCode}): ${error.message}`,
        );
        throw new ActionError({
          code: ActionError.statusToCode(error.statusCode ?? 0),
          message: "Failed to send email. Please try again later.",
        });
      }

      return data;
    },
  }),
};
