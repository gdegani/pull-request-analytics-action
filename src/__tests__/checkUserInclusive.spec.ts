import { checkUserInclusive } from "../converters/utils/calculations/checkUserInclusive";

describe("checkUserInclusive", () => {
  const OLD_EXCLUDE = process.env.EXCLUDE_USERS;
  const OLD_INCLUDE = process.env.INCLUDE_USERS;

  afterEach(() => {
    if (OLD_EXCLUDE === undefined) delete process.env.EXCLUDE_USERS;
    else process.env.EXCLUDE_USERS = OLD_EXCLUDE;
    if (OLD_INCLUDE === undefined) delete process.env.INCLUDE_USERS;
    else process.env.INCLUDE_USERS = OLD_INCLUDE;
  });

  test("returns true when no include/exclude configured", () => {
    delete process.env.EXCLUDE_USERS;
    delete process.env.INCLUDE_USERS;
    expect(checkUserInclusive("alice")).toBe(true);
  });

  test("returns false when user is excluded", () => {
    process.env.EXCLUDE_USERS = "bob,alice";
    delete process.env.INCLUDE_USERS;
    expect(checkUserInclusive("alice")).toBe(false);
    expect(checkUserInclusive("charlie")).toBe(true);
  });

  test("honors include list when present", () => {
    delete process.env.EXCLUDE_USERS;
    process.env.INCLUDE_USERS = "alice,bob";
    expect(checkUserInclusive("alice")).toBe(true);
    expect(checkUserInclusive("charlie")).toBe(false);
  });
});
