import { z } from "zod/mini";

export const NAME_MAX_LENGTH = 255;
export const EMAIL_MAX_LENGTH = 254;
export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 5000;

const getRequiredSchema = (message: string) =>
  z.string().check(z.trim(), z.minLength(1, message));

const getMaxLengthSchema = (max: number, fieldName: string) =>
  z.maxLength(max, `${fieldName} must not exceed ${max} characters.`);

const getMinLengthSchema = (min: number, fieldName: string) =>
  z.minLength(min, `${fieldName} must be at least ${min} characters.`);

export const nameSchema = getRequiredSchema("Please enter your name.").check(
  getMaxLengthSchema(NAME_MAX_LENGTH, "Name"),
  z.regex(/^[\p{L}\p{M}\p{Zs}\-'.]+$/u, "Name contains invalid characters."),
);

export const emailSchema = getRequiredSchema(
  "Please enter your email address.",
).check(
  getMaxLengthSchema(EMAIL_MAX_LENGTH, "Email"),
  z.email("Please enter a valid email address."),
);

export const messageSchema = getRequiredSchema("Please enter a message.").check(
  getMinLengthSchema(MESSAGE_MIN_LENGTH, "Message"),
  getMaxLengthSchema(MESSAGE_MAX_LENGTH, "Message"),
);

export const turnstileResponseSchema = z.string(
  "Security challenge failed. Please select the checkbox below or wait for verification.",
);
