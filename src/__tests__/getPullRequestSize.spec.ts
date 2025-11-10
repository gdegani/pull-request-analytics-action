import { getPullRequestSize } from "../converters/utils/calculations/getPullRequestSize";

describe("getPullRequestSize", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.DELETION_WEIGHT;
    delete process.env.SIZE_XS_THRESHOLD;
    delete process.env.SIZE_S_THRESHOLD;
    delete process.env.SIZE_M_THRESHOLD;
    delete process.env.SIZE_L_THRESHOLD;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("maps small sizes to xs with default thresholds", () => {
    expect(getPullRequestSize(10, 0)).toBe("xs");
    expect(getPullRequestSize(50, 0)).toBe("xs");
  });

  test("maps to s/m/l/xl according to default thresholds", () => {
    expect(getPullRequestSize(100, 0)).toBe("s");
    expect(getPullRequestSize(300, 0)).toBe("m");
    expect(getPullRequestSize(600, 0)).toBe("l");
    expect(getPullRequestSize(1000, 0)).toBe("xl");
  });

  test("accounts for deletions with default deletionWeight (0.2)", () => {
    // deletions are weighted by 0.2 (default), so 1000 deletions -> 200 size -> 's'
    expect(getPullRequestSize(0, 1000)).toBe("s");
  });

  test("uses custom DELETION_WEIGHT when provided", () => {
    process.env.DELETION_WEIGHT = "0.5";
    // deletions weighted by 0.5, so 1000 deletions -> 500 size -> 'l'
    expect(getPullRequestSize(0, 1000)).toBe("l");
  });

  test("uses custom DELETION_WEIGHT for edge cases", () => {
    process.env.DELETION_WEIGHT = "1.0";
    // deletions weighted by 1.0, so 100 deletions -> 100 size -> 's'
    expect(getPullRequestSize(0, 100)).toBe("s");
    
    process.env.DELETION_WEIGHT = "0.1";
    // deletions weighted by 0.1, so 1000 deletions -> 100 size -> 's'
    expect(getPullRequestSize(0, 1000)).toBe("s");
  });

  test("uses custom SIZE_XS_THRESHOLD", () => {
    process.env.SIZE_XS_THRESHOLD = "100";
    expect(getPullRequestSize(50, 0)).toBe("xs");
    expect(getPullRequestSize(100, 0)).toBe("xs");
    expect(getPullRequestSize(101, 0)).toBe("s");
  });

  test("uses custom SIZE_S_THRESHOLD", () => {
    process.env.SIZE_S_THRESHOLD = "300";
    expect(getPullRequestSize(150, 0)).toBe("s");
    expect(getPullRequestSize(300, 0)).toBe("s");
    expect(getPullRequestSize(301, 0)).toBe("m");
  });

  test("uses custom SIZE_M_THRESHOLD", () => {
    process.env.SIZE_M_THRESHOLD = "500";
    expect(getPullRequestSize(250, 0)).toBe("m");
    expect(getPullRequestSize(500, 0)).toBe("m");
    expect(getPullRequestSize(501, 0)).toBe("l");
  });

  test("uses custom SIZE_L_THRESHOLD", () => {
    process.env.SIZE_L_THRESHOLD = "1000";
    expect(getPullRequestSize(600, 0)).toBe("l");
    expect(getPullRequestSize(1000, 0)).toBe("l");
    expect(getPullRequestSize(1001, 0)).toBe("xl");
  });

  test("uses multiple custom thresholds together", () => {
    process.env.SIZE_XS_THRESHOLD = "20";
    process.env.SIZE_S_THRESHOLD = "100";
    process.env.SIZE_M_THRESHOLD = "200";
    process.env.SIZE_L_THRESHOLD = "500";
    
    expect(getPullRequestSize(10, 0)).toBe("xs");
    expect(getPullRequestSize(20, 0)).toBe("xs");
    expect(getPullRequestSize(50, 0)).toBe("s");
    expect(getPullRequestSize(150, 0)).toBe("m");
    expect(getPullRequestSize(300, 0)).toBe("l");
    expect(getPullRequestSize(600, 0)).toBe("xl");
  });
});
