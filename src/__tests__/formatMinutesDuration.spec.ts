import { formatMinutesDuration } from "../view/utils/formatMinutesDuration";

describe("formatMinutesDuration", () => {
  test("formats minutes only", () => {
    const out = formatMinutesDuration(30);
    expect(out.toLowerCase()).toMatch(/30\s*minute/);
  });

  test("formats hours only", () => {
    const out = formatMinutesDuration(60);
    expect(out.toLowerCase()).toMatch(/1\s*hour/);
  });

  test("formats hours and minutes", () => {
    const out = formatMinutesDuration(125);
    // allow flexible spacing/wording from date-fns
    expect(out.toLowerCase()).toMatch(/2\s*hour/);
    expect(out.toLowerCase()).toMatch(/5\s*minute/);
  });
});
