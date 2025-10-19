import { createTSV } from "../outputs/tsv";
import { Collection } from "../converters/types";

describe("TSV workload columns", () => {
  it("includes workload headers and values", () => {
    const data: Record<string, Record<string, Collection>> = {
      alice: {
        "2025-10": {
          opened: 2,
          merged: 1,
          comments: 3,
          reverted: 1,
          unreviewed: 0,
          unapproved: 1,
          additions: 120,
          deletions: 10,
          prSizes: ["s", "m"],
        },
      },
      total: {
        "2025-10": {
          opened: 2,
          merged: 1,
          comments: 3,
        },
      },
    };

    const users = ["alice", "total"];
    const dates = ["2025-10"];

    const tsv = createTSV(data as any, users, dates);
    const lines = tsv.split("\n");

    // header contains new workload columns
    expect(lines[0]).toContain("total_reverted");
    expect(lines[0]).toContain("prs_wo_review");
    expect(lines[0]).toContain("prs_wo_approval");
    expect(lines[0]).toContain("additions");
    expect(lines[0]).toContain("deletions");
    expect(lines[0]).toContain("pr_size_xs");
    expect(lines[0]).toContain("pr_size_s");
    expect(lines[0]).toContain("pr_size_m");
    expect(lines[0]).toContain("pr_size_l");
    expect(lines[0]).toContain("pr_size_xl");

    // check alice row contains expected numeric/string values
    const aliceRow = lines[1].split("\t");
    // find header index for additions/deletions and sizes
    const headers = lines[0].split("\t");
    const additionsIdx = headers.indexOf("additions");
    const deletionsIdx = headers.indexOf("deletions");
    const sIdx = headers.indexOf("pr_size_s");
    const mIdx = headers.indexOf("pr_size_m");

    expect(Number(aliceRow[additionsIdx])).toBe(120);
    expect(Number(aliceRow[deletionsIdx])).toBe(10);
    expect(Number(aliceRow[sIdx])).toBe(1);
    expect(Number(aliceRow[mIdx])).toBe(1);
  });
});
