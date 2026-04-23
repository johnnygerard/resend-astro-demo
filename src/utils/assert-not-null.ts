/**
 * Assert that a value is neither null nor undefined
 * @param value - The value to check
 * @param errorMessage - Custom error message
 * @returns The original value
 * @throws {TypeError} If the value is null or undefined
 */
export const assertNotNull = <T>(
  value: T,
  errorMessage?: string,
): NonNullable<T> => {
  if (value == null) throw new TypeError(errorMessage ?? `Value is ${value}`);
  return value;
};
