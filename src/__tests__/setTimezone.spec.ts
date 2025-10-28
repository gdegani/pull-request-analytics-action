import { setTimezone } from "../common/utils/setTimezone";

describe("setTimezone", () => {
  const OLD_TZ = process.env.TZ;

  afterEach(() => {
    if (OLD_TZ === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = OLD_TZ;
    }
    delete process.env.TIMEZONE;
  });

  test("sets TZ when TIMEZONE env var is present", () => {
    process.env.TIMEZONE = "Europe/Rome";
    setTimezone();
    expect(process.env.TZ).toBe("Europe/Rome");
  });

  test("does nothing when TIMEZONE is not present", () => {
    delete process.env.TIMEZONE;
    delete process.env.TZ;
    setTimezone();
    expect(process.env.TZ).toBeUndefined();
  });
});
