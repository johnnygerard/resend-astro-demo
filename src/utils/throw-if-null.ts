/**
 * Throw if the value is null or undefined.
 * @param value The value to check.
 * @param message The error message to throw if the value is null or undefined.
 * @returns The value if it is neither null nor undefined.
 * @throws {Error} If the value is null or undefined.
 */
export const throwIfNull = <T>(
  value: T | null | undefined,
  message = `Value is ${value}`,
): T => {
  if (value == null) throw new Error(message);
  return value;
};
