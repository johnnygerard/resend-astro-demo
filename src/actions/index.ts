import { v4 as uuid } from "@lukeed/uuid";
import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";
import { sendEmail } from "~/api/send-email";
import { verifyTurnstileToken } from "~/api/verify-turnstile-token";
import { emailSchema, messageSchema, nameSchema } from "~/validation/schemas";

export const server = {
  submitContactForm: defineAction({
    accept: "form",
    input: z.object({
      website: z.string().optional(),
      name: nameSchema,
      email: emailSchema,
      message: messageSchema,
      "cf-turnstile-response": z.string().min(1),
    }),
    handler: async (input, context) => {
      try {
        if (input.website) {
          console.info("Received non-empty honeypot field.");
          return { id: uuid() };
        }

        await verifyTurnstileToken(
          input["cf-turnstile-response"],
          context.clientAddress,
        );

        return await sendEmail({
          from: `John <hello@resend.jgerard.dev>`,
          to: "delivered@resend.dev", // @see https://resend.com/docs/dashboard/emails/send-test-emails
          subject: `New message from ${input.name} (${input.email})`,
          text: input.message,
        });
      } catch (e) {
        if (e instanceof ActionError) throw e;
        console.error(e);

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred. Please try again later.",
        });
      }
    },
  }),
};
