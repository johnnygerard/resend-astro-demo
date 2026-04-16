import { z } from "astro/zod";

export const NAME_MAX_LENGTH = 255;
export const EMAIL_MAX_LENGTH = 254;
export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 5000;

const requiredSchema = (message: string): z.ZodString =>
  z.string().trim().min(1, message);

export const nameSchema = requiredSchema("Please enter your name.").max(
  NAME_MAX_LENGTH,
  `Name must not exceed ${NAME_MAX_LENGTH} characters.`,
);

export const emailSchema = requiredSchema("Please enter your email address.")
  .max(
    EMAIL_MAX_LENGTH,
    `Email must not exceed ${EMAIL_MAX_LENGTH} characters.`,
  )
  .check(z.email("Please enter a valid email address."));

export const messageSchema = requiredSchema("Please enter a message.")
  .min(
    MESSAGE_MIN_LENGTH,
    `Message must be at least ${MESSAGE_MIN_LENGTH} characters.`,
  )
  .max(
    MESSAGE_MAX_LENGTH,
    `Message must not exceed ${MESSAGE_MAX_LENGTH} characters.`,
  );
