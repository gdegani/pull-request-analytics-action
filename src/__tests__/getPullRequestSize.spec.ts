import { getPullRequestSize } from "../converters/utils/calculations/getPullRequestSize";

describe("getPullRequestSize", () => {
  test("maps small sizes to xs", () => {
    expect(getPullRequestSize(10, 0)).toBe("xs");
    expect(getPullRequestSize(50, 0)).toBe("xs");
  });

  test("maps to s/m/l/xl according to thresholds", () => {
    expect(getPullRequestSize(100, 0)).toBe("s");
    expect(getPullRequestSize(300, 0)).toBe("m");
    expect(getPullRequestSize(600, 0)).toBe("l");
    expect(getPullRequestSize(1000, 0)).toBe("xl");
  });

  test("accounts for deletions with deletionCoefficient", () => {
    // deletions are weighted by 0.2, so 1000 deletions -> 200 size -> 's'
    expect(getPullRequestSize(0, 1000)).toBe("s");
  });
});
