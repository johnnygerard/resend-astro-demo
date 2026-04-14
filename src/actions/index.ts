import { v4 as uuid } from "@lukeed/uuid";
import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";
import { RESEND_API_KEY } from "astro:env/server";
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
        .min(1, validationMessages.name.valueMissing)
        .max(NAME_MAX_LENGTH, validationMessages.name.tooLong),
      email: z
        .string()
        .min(1, validationMessages.email.valueMissing)
        .max(EMAIL_MAX_LENGTH, validationMessages.email.tooLong)
        .and(z.email(validationMessages.email.typeMismatch)),
      message: z
        .string()
        .min(1, validationMessages.message.valueMissing)
        .max(MESSAGE_MAX_LENGTH, validationMessages.message.tooLong),
    }),
    handler: async (input) => {
      if (input.website?.length) {
        console.log("Received non-empty honeypot field.");
        return { id: uuid() } as CreateEmailResponseSuccess;
      }

      const { data, error } = await resend.emails.send({
        from: `John <noreply@resend.jgerard.dev>`,
        to: "delivered@resend.dev", // @see https://resend.com/docs/dashboard/emails/send-test-emails
        subject: `New message from ${input.name} (${input.email})`,
        text: input.message,
      });

      if (error)
        throw new ActionError({
          code: ActionError.statusToCode(error.statusCode ?? 0),
          message: `Failed to send email (type: ${error.name}, status: ${error.statusCode}): ${error.message}`,
        });

      return data;
    },
  }),
};
