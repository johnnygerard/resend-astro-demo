const getVariable = (key: string, value: unknown): string => {
  if (typeof value === "string") return value;
  if (value === undefined)
    throw new Error(`Missing environment variable: ${key}`);
  throw new TypeError(
    `Unexpected type for environment variable ${key}: ${typeof value}`,
  );
};

// Bracket notation is avoided because Vite uses static analysis to replace
// `import.meta.env.VARIABLE_NAME` with the actual value at build time.
export const ENV = {
  CF_TURNSTILE_SECRET_KEY: getVariable(
    "CF_TURNSTILE_SECRET_KEY",
    import.meta.env.CF_TURNSTILE_SECRET_KEY,
  ),
  PUBLIC_CF_TURNSTILE_SITEKEY: getVariable(
    "PUBLIC_CF_TURNSTILE_SITEKEY",
    import.meta.env.PUBLIC_CF_TURNSTILE_SITEKEY,
  ),
  RECIPIENT_EMAIL: getVariable(
    "RECIPIENT_EMAIL",
    import.meta.env.RECIPIENT_EMAIL,
  ),
  RESEND_API_KEY: getVariable("RESEND_API_KEY", import.meta.env.RESEND_API_KEY),
  SENDER_EMAIL: getVariable("SENDER_EMAIL", import.meta.env.SENDER_EMAIL),
};
