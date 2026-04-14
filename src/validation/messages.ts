export const NAME_MAX_LENGTH = 255;
export const EMAIL_MAX_LENGTH = 254;
export const MESSAGE_MAX_LENGTH = 5000;

export const validationMessages = {
  name: {
    valueMissing: "Please enter your name.",
    tooLong: `Name must not exceed ${NAME_MAX_LENGTH} characters.`,
  },
  email: {
    valueMissing: "Please enter your email address.",
    tooLong: `Email must not exceed ${EMAIL_MAX_LENGTH} characters.`,
    typeMismatch: "Please enter a valid email address.",
  },
  message: {
    valueMissing: "Please enter a message.",
    tooLong: `Message must not exceed ${MESSAGE_MAX_LENGTH} characters.`,
  },
} as const satisfies Record<
  string,
  {
    [Key in keyof ValidityStateFlags]: string;
  }
>;
