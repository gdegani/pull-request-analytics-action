import { prepareConductedReviews } from "../converters/utils/prepareConductedReviews";

describe("prepareConductedReviews", () => {
  test("increments statuses for author, total and teams and appends size", () => {
    const pullRequestLogin = "alice";
    const reviews = [
      { state: "APPROVED" },
      { state: "CHANGES_REQUESTED" },
      { state: "APPROVED" },
    ];
    const initialCollection: any = {
      reviewsConducted: {
        total: { APPROVED: 1 },
        alice: { APPROVED: 2 },
      },
      reviewsConductedSize: ["s"],
    };
    const teams = { alice: ["team1", "team2"] };

    const out = prepareConductedReviews(
      pullRequestLogin,
      reviews as any[],
      initialCollection,
      "m",
      teams
    );

    // reviewsConducted should have counts increased
    expect(out.reviewsConducted.alice.APPROVED).toBeGreaterThanOrEqual(2);
    expect(out.reviewsConducted.total.APPROVED).toBeGreaterThanOrEqual(1);
    // team members should be present
    expect(out.reviewsConducted.team1.APPROVED).toBeDefined();
    expect(out.reviewsConducted.team2.CHANGES_REQUESTED).toBeDefined();

    // reviewsConductedSize appended new size
    expect(out.reviewsConductedSize.slice(-1)[0]).toBe("m");
  });

  test("respects checkUserInclusive excluding keys", () => {
    // if INCLUDE_USERS restricts to bob, alice should be excluded
    process.env.INCLUDE_USERS = "bob";
    const pullRequestLogin = "alice";
    const reviews = [{ state: "APPROVED" }];
    const initialCollection: any = { reviewsConducted: {}, reviewsConductedSize: [] };
    const teams = { alice: ["team1"] };

    const out = prepareConductedReviews(pullRequestLogin, reviews as any[], initialCollection, "s", teams);
    // alice should not be present because INCLUDE_USERS doesn't include her
    expect(out.reviewsConducted.alice).toBeUndefined();
    // total also excluded because key 'total' is not in INCLUDE_USERS
    expect(out.reviewsConducted.total).toBeUndefined();
    // cleanup
    delete process.env.INCLUDE_USERS;
  });
});
