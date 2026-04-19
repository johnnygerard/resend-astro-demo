import { v4 as uuid } from "@lukeed/uuid";
import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";
import { Resend, type CreateEmailResponseSuccess } from "resend";
import { verifyTurnstileToken } from "~/api/verify-turnstile-token";
import { emailSchema, messageSchema, nameSchema } from "~/validation/schemas";

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const MISSING_CF_TURNSTILE_TOKEN_ERROR =
  "CAPTCHA verification failed. Please try again.";

export const server = {
  // The following server action will be used with a basic contact form.
  send: defineAction({
    accept: "form",
    input: z.object({
      website: z.string().optional(),
      name: nameSchema,
      email: emailSchema,
      message: messageSchema,
      "cf-turnstile-response": z
        .string(MISSING_CF_TURNSTILE_TOKEN_ERROR)
        .min(1, MISSING_CF_TURNSTILE_TOKEN_ERROR),
    }),
    handler: async (input) => {
      if (input.website) {
        console.log("Received non-empty honeypot field.");
        return { id: uuid() } satisfies CreateEmailResponseSuccess;
      }

      await verifyTurnstileToken(input["cf-turnstile-response"]);

      const { data, error } = await resend.emails.send({
        from: `John <hello@resend.jgerard.dev>`,
        to: "delivered@resend.dev", // @see https://resend.com/docs/dashboard/emails/send-test-emails
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
