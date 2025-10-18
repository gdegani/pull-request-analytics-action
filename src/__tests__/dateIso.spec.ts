import { createTSV } from "../outputs/tsv";
import { Collection } from "../converters/types";
import * as utils from "../common/utils/getDateFormat";

describe("date_iso generation", () => {
  it("computes ISO week start date for week buckets", () => {
    // mock getDateFormat to return week
    jest.spyOn(require("../common/utils/getDateFormat"), "getDateFormat").mockReturnValue("W/y");

    const data: Record<string, Record<string, Collection>> = {
      alice: {
        "W01/2019": { opened: 1, merged: 1, comments: 0 },
      },
      total: {
        "W01/2019": { opened: 1, merged: 1, comments: 0 },
      },
    } as any;
    const users = ["alice", "total"];
    const dates = ["W01/2019"];

    const tsv = createTSV(data as any, users, dates);
    const header = tsv.split("\n")[0];
    const firstRow = tsv.split("\n")[1];

    // header must include date_iso and date_iso_end
    expect(header).toContain("date_iso");
    expect(header).toContain("date_iso_end");
    // W01/2019 ISO week 1 of 2019 starts on 2018-12-31 (Monday) and ends on 2019-01-06 (Sunday)
    const parts = firstRow.split("\t");
    expect(parts[0]).toBe("2018-12-31");
    expect(parts[1]).toBe("2019-01-06");
  });

  it("computes month start date for month buckets", () => {
    jest.spyOn(require("../common/utils/getDateFormat"), "getDateFormat").mockReturnValue("M/y");

    const data: Record<string, Record<string, Collection>> = {
      alice: {
        "1/2025": { opened: 1, merged: 1, comments: 0 },
      },
      total: {
        "1/2025": { opened: 1, merged: 1, comments: 0 },
      },
    } as any;
    const users = ["alice", "total"];
    const dates = ["1/2025"];

    const tsv = createTSV(data as any, users, dates);
    const firstRow = tsv.split("\n")[1];

    const parts = firstRow.split("\t");
    // month start should be 2025-01-01 and month end 2025-01-31
    expect(parts[0]).toBe("2025-01-01");
    expect(parts[1]).toBe("2025-01-31");
  });

  it("computes quarter start/end for quarter buckets", () => {
    jest.spyOn(require("../common/utils/getDateFormat"), "getDateFormat").mockReturnValue("QQQ/y");

    const data: Record<string, Record<string, Collection>> = {
      alice: {
        "Q1/2024": { opened: 1, merged: 1, comments: 0 },
      },
      total: {
        "Q1/2024": { opened: 1, merged: 1, comments: 0 },
      },
    } as any;
    const users = ["alice", "total"];
    const dates = ["Q1/2024"];

    const tsv = createTSV(data as any, users, dates);
    const firstRow = tsv.split("\n")[1];
    const parts = firstRow.split("\t");
    expect(parts[0]).toBe("2024-01-01");
    expect(parts[1]).toBe("2024-03-31");
  });

  it("computes year start/end for year buckets", () => {
    jest.spyOn(require("../common/utils/getDateFormat"), "getDateFormat").mockReturnValue("y");

    const data: Record<string, Record<string, Collection>> = {
      alice: {
        "2023": { opened: 1, merged: 1, comments: 0 },
      },
      total: {
        "2023": { opened: 1, merged: 1, comments: 0 },
      },
    } as any;
    const users = ["alice", "total"];
    const dates = ["2023"];

    const tsv = createTSV(data as any, users, dates);
    const firstRow = tsv.split("\n")[1];
    const parts = firstRow.split("\t");
    expect(parts[0]).toBe("2023-01-01");
    expect(parts[1]).toBe("2023-12-31");
  });
});
