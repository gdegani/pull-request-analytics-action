import { getResponses } from "../converters/utils/calculations/getResponses";

describe("getResponses", () => {
  const OLD_EXCLUDE = process.env.EXCLUDE_USERS;
  const OLD_INCLUDE = process.env.INCLUDE_USERS;

  afterEach(() => {
    if (OLD_EXCLUDE === undefined) delete process.env.EXCLUDE_USERS;
    else process.env.EXCLUDE_USERS = OLD_EXCLUDE;
    if (OLD_INCLUDE === undefined) delete process.env.INCLUDE_USERS;
    else process.env.INCLUDE_USERS = OLD_INCLUDE;
  });

  test("collects review requests and matches reviews to the last request", () => {
    // ensure include/exclude empty so all users counted
    delete process.env.EXCLUDE_USERS;
    delete process.env.INCLUDE_USERS;

    const events = [
      // request by alice
      { event: "review_requested", requested_reviewer: { login: "alice" }, created_at: "2025-10-01T10:00:00Z" },
      // request by bob
      { event: "review_requested", requested_reviewer: { login: "bob" }, created_at: "2025-10-01T11:00:00Z" },
      // alice reviews (should attach to alice's last request)
      { event: "reviewed", user: { login: "alice" }, submitted_at: "2025-10-01T12:00:00Z" },
      // remove bob's request
      { event: "review_request_removed", requested_reviewer: { login: "bob" } },
      // another review by carol without prior request
      { event: "reviewed", user: { login: "carol" }, submitted_at: "2025-10-01T13:00:00Z" },
    ];

    const res = getResponses(events as any[]);

    expect(res.alice).toBeDefined();
    expect(res.alice.length).toBe(1);
    expect(res.alice[0][0]).toBe("2025-10-01T10:00:00Z");
    expect(res.alice[0][1]).toBe("2025-10-01T12:00:00Z");

    // bob's request was removed -> its entries should have second element null
    expect(res.bob).toBeDefined();
    expect(res.bob[0][1]).toBeNull();

    // carol had a review without prior request -> should have [null, submitted_at]
    expect(res.carol).toBeDefined();
    expect(res.carol[0][0]).toBeNull();
    expect(res.carol[0][1]).toBe("2025-10-01T13:00:00Z");
  });

  test("skips excluded users via EXCLUDE_USERS", () => {
    process.env.EXCLUDE_USERS = "dave";
    const events = [
      { event: "review_requested", requested_reviewer: { login: "dave" }, created_at: "2025-10-01T10:00:00Z" },
      { event: "reviewed", user: { login: "dave" }, submitted_at: "2025-10-01T11:00:00Z" },
    ];
    const res = getResponses(events as any[]);
    expect(res.dave).toBeUndefined();
  });
});
