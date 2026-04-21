import type { z } from "zod/mini";

/**
 * Parse and validate the JSON body of an API response using a Zod schema.
 * @param response - A response object from the Fetch API
 * @param schema - A Zod schema to validate the parsed JSON against
 * @param apiName - The name of the API (used for error messages)
 * @returns The parsed and validated JSON data
 * @throws An error if parsing fails or if validation fails
 */
export const parseAndValidateJsonBody = async <T extends z.ZodMiniType>(
  response: Response,
  schema: T,
  apiName: string,
): Promise<z.infer<T>> => {
  let value: unknown;

  try {
    value = await response.json();
  } catch (e) {
    throw new Error(`Failed to parse JSON payload from ${apiName} response`, {
      cause: e,
    });
  }

  const { success, data, error } = schema.safeParse(value);
  if (success) return data;
  throw new Error(`Invalid JSON payload from ${apiName} response`, {
    cause: error,
  });
};
