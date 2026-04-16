/**
 * Assert that a value is neither null nor undefined.
 * @param value - The value to check.
 * @returns The unmodified value if it is not null or undefined.
 * @throws {TypeError} If the value is null or undefined.
 */
export const assertNotNull = <T>(value: T | null | undefined): T => {
  if (value != null) return value;
  throw new TypeError("Expected value to be defined or non-null");
};
