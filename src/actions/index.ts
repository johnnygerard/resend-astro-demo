import { v4 as uuid } from "@lukeed/uuid";
import { ActionError, defineAction } from "astro:actions";
import { waitUntil } from "cloudflare:workers";
import { z } from "zod/mini";
import { rateLimiters } from "~/api/rate-limiters";
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

        const [userRateLimitResult, globalRateLimitResult] = await Promise.all([
          rateLimiters.user.limit(context.clientAddress),
          rateLimiters.global.limit("global"),
        ]);

        // Keep Cloudflare worker alive for sending analytics.
        // @see https://upstash.com/docs/redis/sdks/ratelimit-ts/features#asynchronous-synchronization-between-databases
        waitUntil(userRateLimitResult.pending);
        waitUntil(globalRateLimitResult.pending);

        if (!userRateLimitResult.success || !globalRateLimitResult.success)
          throw new ActionError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests. Please try again shortly.",
          });

        await verifyTurnstileToken(
          input["cf-turnstile-response"],
          context.clientAddress,
        );

        return await sendEmail({
          from: runtimeEnv.EMAIL_SENDER,
          to: runtimeEnv.EMAIL_RECIPIENT.split(",").map((email) =>
            email.trim(),
          ),
          subject: `New message from "${input.name}" <${input.email}>`,
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
