import type { EnvironmentVariable } from "~/types/environment-variable";

/**
 * Retrieve and validate an environment variable exposed by Vite from `import.meta.env`.
 * @param key - The environment variable name (e.g. `"MY_VARIABLE"`)
 * @returns The string value of the environment variable
 * @throws If the variable is missing or not a string
 * @see https://vite.dev/guide/env-and-mode
 * @see https://docs.astro.build/en/guides/environment-variables/
 */
export const getVariable = (key: EnvironmentVariable): string => {
  const value: unknown = import.meta.env[key];
  if (typeof value === "string") return value;

  if (value === undefined)
    throw new Error(`Missing environment variable: ${key}`);

  throw new TypeError(
    `Unexpected type for environment variable ${key}: ${typeof value}`,
  );
};
