import { v4 as uuid } from "@lukeed/uuid";
import { ActionError, defineAction } from "astro:actions";
import { z } from "zod/mini";
import { rateLimitGlobally, rateLimitUser } from "~/api/rate-limit";
import { sendEmail } from "~/api/send-email";
import { verifyTurnstileToken } from "~/api/verify-turnstile-token";
import { runtimeEnv } from "~/runtime-env";
import { emailSchema, messageSchema, nameSchema } from "~/validation/schemas";

export const server = {
  submitContactForm: defineAction({
    accept: "form",
    input: z.object({
      sushi: z.optional(z.string()), // Honeypot field
      name: nameSchema,
      email: emailSchema,
      message: messageSchema,
      "cf-turnstile-response": z.string().check(z.minLength(1)),
    }),
    handler: async (input, context) => {
      try {
        if (input.sushi) {
          console.info("Received non-empty honeypot field.");
          // Pretend the submission was successful to avoid tipping off bots.
          return { id: uuid() };
        }

        // This rate limiter also protects the Siteverify API (Turnstile) from
        // validation flooding.
        await rateLimitUser(context.clientAddress);

        await verifyTurnstileToken(
          input["cf-turnstile-response"],
          context.clientAddress,
        );

        await rateLimitGlobally();

        return await sendEmail({
          from: runtimeEnv.EMAIL_SENDER,
          to: runtimeEnv.EMAIL_RECIPIENT.split(",").map((email) =>
            email.trim(),
          ),
          subject: `New message from "${input.name}" <${input.email}>`,
          reply_to: input.email,
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
