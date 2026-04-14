import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";
import { RESEND_API_KEY } from "astro:env/server";
import { Resend } from "resend";

const resend = new Resend(RESEND_API_KEY);

export const server = {
  // The following server action will be used with a basic contact form.
  send: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().trim().min(1).max(255),
      email: z.email(),
      message: z.string().trim().min(10).max(5000),
    }),
    handler: async (input) => {
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
