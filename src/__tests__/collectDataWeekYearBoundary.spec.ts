import { collectData } from "../converters/collectData";
import { parseISO } from "date-fns";
import * as utils from "../common/utils/getValueAsIs";

describe("collectData ISO week year-boundary bucketing", () => {
  it("groups Dec 31 and Jan 1 into the same ISO week when appropriate", () => {
    jest.spyOn(utils, "getValueAsIs").mockImplementation((name: string) => {
      if (name === "PERIOD_SPLIT_UNIT") return "week";
      return "";
    });

    const prDec31 = {
      closed_at: "2018-12-31T12:00:00Z", // Monday, in ISO week 1 of 2019
      user: { login: "bob" },
      comments: 0,
      review_comments: 0,
      merged: true,
      additions: 5,
      deletions: 0,
      head: { ref: "feature/x" },
    } as any;

    const prJan1 = {
      closed_at: "2019-01-01T12:00:00Z", // Tuesday, same ISO week 1 of 2019
      user: { login: "bob" },
      comments: 0,
      review_comments: 0,
      merged: false,
      additions: 2,
      deletions: 0,
      head: { ref: "feature/y" },
    } as any;

    const data = {
      pullRequestInfo: [prDec31, prJan1],
      events: [[], []],
      comments: [],
    } as any;

    const collection = collectData(data, {});

    const { getISOWeek, getISOWeekYear } = require("date-fns");
  const d = parseISO(prJan1.closed_at); // ISO week-year should be based on Jan 1 date
    const week = getISOWeek(d);
    const year = getISOWeekYear(d);
    const weekKey = `W${String(week).padStart(2, "0")}/${year}`;

    expect(collection.total[weekKey]).toBeDefined();
    expect(collection.bob[weekKey]).toBeDefined();
    expect(collection.bob[weekKey].opened).toBe(2);
  });
});
