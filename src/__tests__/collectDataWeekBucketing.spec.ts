import { collectData } from "../converters/collectData";
import { format, parseISO } from "date-fns";
import * as utils from "../common/utils/getValueAsIs";

describe("collectData weekly bucketing", () => {
  it("groups PRs by ISO week when PERIOD_SPLIT_UNIT=week", () => {
    jest.spyOn(utils, "getValueAsIs").mockImplementation((name: string) => {
      if (name === "PERIOD_SPLIT_UNIT") return "week";
      return "";
    });

    const pr1 = {
      closed_at: "2025-10-13T12:00:00Z", // Monday
      user: { login: "alice" },
      comments: 1,
      review_comments: 0,
      merged: true,
      additions: 10,
      deletions: 2,
      head: { ref: "feature/1" },
    } as any;

    const pr2 = {
      closed_at: "2025-10-17T12:00:00Z", // Friday same ISO week
      user: { login: "alice" },
      comments: 0,
      review_comments: 1,
      merged: false,
      additions: 1,
      deletions: 0,
      head: { ref: "feature/2" },
    } as any;

    const data = {
      pullRequestInfo: [pr1, pr2],
      events: [[], []],
      comments: [],
    } as any;

    const collection = collectData(data, {});

    // compute expected key using same format
  const { getISOWeek, getISOWeekYear } = require("date-fns");
  const d = parseISO(pr1.closed_at);
  const week = getISOWeek(d);
  const year = getISOWeekYear(d);
  const weekKey = `W${String(week).padStart(2, "0")}/${year}`;

    expect(collection.total[weekKey]).toBeDefined();
    expect(collection.alice[weekKey]).toBeDefined();
    expect(collection.alice[weekKey].opened).toBe(2);
  });
});
