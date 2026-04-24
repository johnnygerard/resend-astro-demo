import { describe, expect, test } from "vitest";
import { nameSchema } from "~/validation/schemas";
import names from "~root/__tests__/names.json";

describe("The name schema regex validation should", () => {
  test("accept valid names", () => {
    for (const scriptNames of Object.values(names))
      for (const name of scriptNames)
        expect(nameSchema.safeParse(name).success).toBe(true);
  });

  test("reject C0 control characters", () => {
    const charset = [];
    for (let i = 0; i < 0x20; i++) charset.push(String.fromCharCode(i));
    charset.push(String.fromCharCode(0x7f)); // DEL character

    for (const char of charset)
      expect(nameSchema.safeParse(`invalid${char}name`).success).toBe(false);
  });

  test("reject numbers", () => {
    expect(nameSchema.safeParse("invalid123").success).toBe(false);
  });

  test("reject special characters", () => {
    const specialChars = '!@#$%^&*()_+[]{}|;:",/<>?`~';
    for (const char of specialChars)
      expect(
        nameSchema.safeParse(`invalid${char}name`).success,
        `Failed to reject name with character: "${char}"`,
      ).toBe(false);
  });
});
