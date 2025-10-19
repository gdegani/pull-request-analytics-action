import { Collection } from "../converters";
import { formatMinutesDuration } from "../view/utils/formatMinutesDuration";
import { getValueAsIs } from "../common/utils";
import {
  format,
  setISOWeek,
  startOfISOWeek,
  endOfISOWeek,
  parse,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns";
import { getDateFormat } from "../common/utils";

const flattenRow = (row: Record<string, any>, headers: string[]) =>
  headers.map((h) => (row[h] === undefined || row[h] === null ? "" : String(row[h]))).join("\t");

// Timeline metric keys
const timelineKeys = [
  "timeInDraft",
  "timeToReviewRequest",
  "timeToReview",
  "timeWaitingForRepeatedReview",
  "timeToApprove",
  "timeToMerge",
];

export const createTSV = (
  data: Record<string, Record<string, Collection>>,
  users: string[],
  dates: string[]
) => {
  // Build headers: basic columns + timeline metrics for avg/median/percentile
  // include ISO date columns (start/end) for machine-friendly date handling when available
  const baseHeaders = [
    "date_iso",
    "date_iso_end",
    "date",
    "user",
    "total_merged",
    "total_opened",
    "total_comments",
    // Workload / contribution columns
    "total_reverted",
    "prs_wo_review",
    "prs_wo_approval",
    // separate numeric additions and deletions for machine consumption
    "additions",
    "deletions",
    // individual PR size buckets
    "pr_size_xs",
    "pr_size_s",
    "pr_size_m",
    "pr_size_l",
    "pr_size_xl",
  ];

  const metricHeaders: string[] = [];
  const pct = parseInt(getValueAsIs("PERCENTILE") || "75");
  // For each timeline metric emit both a formatted string column and a numeric minutes column
  ["avg", "med"].forEach((prefix) => {
    timelineKeys.forEach((k) => {
      metricHeaders.push(`${prefix}_${k}`); // formatted human-friendly
      metricHeaders.push(`${prefix}_${k}_minutes`); // numeric (minutes)
    });
  });
  // percentile column uses configured percentile value in header, e.g. pct75_timeToReview
  timelineKeys.forEach((k) => {
    metricHeaders.push(`pct${pct}_${k}`); // formatted
    metricHeaders.push(`pct${pct}_${k}_minutes`); // numeric
  });

  const headers = baseHeaders.concat(metricHeaders);
  const rows: string[] = [];
  rows.push(headers.join("\t"));

  for (const date of dates) {
    for (const user of users) {
      const collection = data[user]?.[date] || ({} as any);
      // determine date_iso: it must contain the first day of the grouping interval
      // supported group formats: YYYY-MM-DD (day), W##/YYYY (ISO week), M/y (month), QQQ/y (quarter), y (year)
  let dateIso = "";
  let dateIsoEnd = "";
      const isoDateMatch = /^(\d{4}-\d{2}-\d{2})$/.exec(date);
      if (isoDateMatch) {
        // already a day
        dateIso = isoDateMatch[1];
        dateIsoEnd = isoDateMatch[1];
      } else {
        const df = getDateFormat();
        try {
          if (df === "W/y") {
            const weekMatch = /^W(\d{2})\/(\d{4})$/.exec(date);
            if (weekMatch) {
              const week = parseInt(weekMatch[1], 10);
              const year = parseInt(weekMatch[2], 10);
              const reference = new Date(year, 0, 4);
              const withWeek = setISOWeek(reference, week);
              const start = startOfISOWeek(withWeek);
              const end = endOfISOWeek(withWeek);
              dateIso = format(start, "yyyy-MM-dd");
              dateIsoEnd = format(end, "yyyy-MM-dd");
            }
          } else if (df === "M/y") {
            // month label like `1/2025` or `12/2025` — parse as month/year and return first day
            const monthMatch = /^(\d{1,2})\/(\d{4})$/.exec(date);
            if (monthMatch) {
              const month = parseInt(monthMatch[1], 10);
              const year = parseInt(monthMatch[2], 10);
              const parsed = parse(`${year}-${String(month).padStart(2, "0")}-01`, "yyyy-MM-dd", new Date());
              const start = startOfMonth(parsed);
              const end = endOfMonth(parsed);
              dateIso = format(start, "yyyy-MM-dd");
              dateIsoEnd = format(end, "yyyy-MM-dd");
            }
          } else if (df === "QQQ/y") {
            // quarter label like "Q1/2025" — parse quarter and year, return first day of quarter
            const quarterMatch = /^Q(\d)\/(\d{4})$/.exec(date);
            if (quarterMatch) {
              const quarter = parseInt(quarterMatch[1], 10);
              const year = parseInt(quarterMatch[2], 10);
              // compute month: quarters map to months 0,3,6,9 (Jan,Apr,Jul,Oct)
              const month = (quarter - 1) * 3 + 1;
              const parsed = parse(`${year}-${String(month).padStart(2, "0")}-01`, "yyyy-MM-dd", new Date());
              const start = startOfQuarter(parsed);
              const end = endOfQuarter(parsed);
              dateIso = format(start, "yyyy-MM-dd");
              dateIsoEnd = format(end, "yyyy-MM-dd");
            }
          } else if (df === "y") {
            const yearMatch = /^(\d{4})$/.exec(date);
            if (yearMatch) {
              const year = parseInt(yearMatch[1], 10);
              const start = startOfYear(new Date(year, 0, 1));
              const end = endOfYear(new Date(year, 0, 1));
              dateIso = format(start, "yyyy-MM-dd");
              dateIsoEnd = format(end, "yyyy-MM-dd");
            }
          }
        } catch (err) {
          dateIso = "";
        }
      }

      const row: Record<string, any> = {
        date_iso: dateIso,
        date_iso_end: dateIsoEnd,
        date,
        user,
        total_merged: collection.merged || 0,
        total_opened: collection.opened || 0,
        total_comments: collection.comments || 0,
        // workload fields
        total_reverted: collection.reverted || 0,
        prs_wo_review: collection.unreviewed || 0,
        prs_wo_approval: collection.unapproved || 0,
        // numeric additions/deletions
        additions: collection.additions || 0,
        deletions: collection.deletions || 0,
        // individual size buckets
        pr_size_xs: (collection.prSizes?.filter((ps: string) => ps === "xs").length) || 0,
        pr_size_s: (collection.prSizes?.filter((ps: string) => ps === "s").length) || 0,
        pr_size_m: (collection.prSizes?.filter((ps: string) => ps === "m").length) || 0,
        pr_size_l: (collection.prSizes?.filter((ps: string) => ps === "l").length) || 0,
        pr_size_xl: (collection.prSizes?.filter((ps: string) => ps === "xl").length) || 0,
      };

      // populate timeline metrics: average, median, percentile (raw minutes)
      timelineKeys.forEach((k) => {
        const avg = (collection.average as any)?.[k];
        const med = (collection.median as any)?.[k];
        const pctv = (collection.percentile as any)?.[k];
        row[`avg_${k}`] = typeof avg === "number" ? formatMinutesDuration(avg) : "";
        row[`avg_${k}_minutes`] = typeof avg === "number" ? avg : "";

        row[`med_${k}`] = typeof med === "number" ? formatMinutesDuration(med) : "";
        row[`med_${k}_minutes`] = typeof med === "number" ? med : "";

        row[`pct${pct}_${k}`] = typeof pctv === "number" ? formatMinutesDuration(pctv) : "";
        row[`pct${pct}_${k}_minutes`] = typeof pctv === "number" ? pctv : "";
      });

      rows.push(flattenRow(row, headers));
    }
  }

  return rows.join("\n");
};

export default createTSV;
