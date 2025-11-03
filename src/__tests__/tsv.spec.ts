import { createTSV } from "../outputs/tsv";
import { Collection } from "../converters/types";

describe("TSV output generator", () => {
  it("creates TSV with header and rows", () => {
    const data: Record<string, Record<string, Collection>> = {
      alice: {
        "2025-10": { opened: 2, merged: 1, comments: 3 },
      },
      bob: {
        "2025-10": { opened: 1, merged: 1, comments: 0 },
      },
      total: {
        "2025-10": { opened: 3, merged: 2, comments: 3 },
      },
    };
    const users = ["alice", "bob", "total"];
    const dates = ["2025-10"];

    const tsv = createTSV(data as any, users, dates);
    const lines = tsv.split("\n");
  expect(lines[0]).toContain("date_iso\tdate_iso_end\tdate\tuser\ttotal_merged");
    // header + 3 users
    expect(lines.length).toBe(4);
    expect(lines[1]).toContain("alice");
    expect(lines[2]).toContain("bob");
    expect(lines[3]).toContain("total");
  // check that new timeline columns exist (formatted)
  expect(lines[0]).toContain("avg_timeToReview");
  expect(lines[0]).toContain("med_timeToMerge");
  // numeric hours columns
  expect(lines[0]).toContain("avg_timeToReview_hours");
  expect(lines[0]).toContain("med_timeToMerge_hours");
  // PERCENTILE default is 75, header should include pct75_ and the hours variant
  expect(lines[0]).toContain("pct75_timeInDraft");
  expect(lines[0]).toContain("pct75_timeInDraft_hours");
  });
});
