import { clsx, type ClassValue } from "clsx";

/**
 * No-op wrapper function around `clsx` enabling:
 * - Tailwind CSS IntelliSense (VS Code extension)
 * - Prettier plugin for Tailwind CSS
 *
 * @example
 * ```ts
 * const button = tw(
 *   "text-sm text-amber-50 font-semibold",
 *   {
 *     "bg-amber-500 hover:bg-amber-600": isPrimary,
 *     "bg-amber-100 text-amber-700 hover:bg-amber-200": isSecondary,
 *   },
 * );
 * ```
 */
export const tw = (...args: ClassValue[]): string => clsx(...args);
