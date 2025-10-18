import { invalidDate } from "./../../converters/constants";
import { isBefore, parse } from "date-fns";
import { getDateFormat } from "../../common/utils";
import { Collection } from "../../converters/types";

export const sortCollectionsByDate = (
  collections: Record<string, Collection>
) =>
  Object.keys(collections)
    .filter((key) => key !== invalidDate)
    .slice()
    .sort((a, b) => {
      if (a === "total") return 1;
      if (b === "total") return -1;
      const df = getDateFormat();
      if (df === "W/y") {
        // parse W##/YYYY format
        const [aw, ay] = a.split("/");
        const [bw, by] = b.split("/");
        const aWeek = parseInt(aw.replace(/^W/, ""), 10) || 0;
        const bWeek = parseInt(bw.replace(/^W/, ""), 10) || 0;
        const aYear = parseInt(ay, 10) || 0;
        const bYear = parseInt(by, 10) || 0;
        if (aYear === bYear) return aWeek < bWeek ? 1 : -1;
        return aYear < bYear ? 1 : -1;
      }
      return isBefore(
        parse(a, df, new Date()),
        parse(b, df, new Date())
      )
        ? 1
        : -1;
    });
