/**
 * Assert that a value is an instance of a specified constructor.
 * @param value - The value to check.
 * @param constructor - The constructor function to check against.
 * @returns The unmodified value if it is an instance of the constructor.
 * @throws {TypeError} If the value is not an instance of the constructor.
 */
export const assertInstanceOf = <T>(
  value: unknown,
  constructor: abstract new (...args: unknown[]) => T,
): T => {
  if (value instanceof constructor) return value;

  throw new TypeError(
    `Expected an instance of ${constructor.name}, but received ${String(value)}.`,
  );
};
