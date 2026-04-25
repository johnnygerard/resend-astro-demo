type Factory<T> = () => T;

/**
 * Lazy evaluation with memoization
 * @example
 * ```ts
 * let counter = 0;
 * const value = lazy(() => ++counter);
 * console.log(counter); // 0
 * console.log(value()); // 1
 * console.log(value()); // 1
 * console.log(counter); // 1
 * ```
 */
export const lazy = <T>(factory: Factory<T>): Factory<T> => {
  let computed = false;
  let value: T;

  return (): T => {
    if (!computed) {
      value = factory();
      computed = true;
    }
    return value;
  };
};
