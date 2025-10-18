import { Collection } from "../converters";
import { formatMinutesDuration } from "../view/utils/formatMinutesDuration";
import { getValueAsIs } from "../common/utils";

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
  const baseHeaders = ["date", "user", "total_merged", "total_opened", "total_comments"];

  const metricHeaders: string[] = [];
  const pct = parseInt(getValueAsIs("PERCENTILE") || "75");
  ["avg", "med"].forEach((prefix) => {
    timelineKeys.forEach((k) => metricHeaders.push(`${prefix}_${k}`));
  });
  // percentile column uses configured percentile value in header, e.g. pct75_timeToReview
  timelineKeys.forEach((k) => metricHeaders.push(`pct${pct}_${k}`));

  const headers = baseHeaders.concat(metricHeaders);
  const rows: string[] = [];
  rows.push(headers.join("\t"));

  for (const date of dates) {
    for (const user of users) {
      const collection = data[user]?.[date] || ({} as any);
      const row: Record<string, any> = {
        date,
        user,
        total_merged: collection.merged || 0,
        total_opened: collection.opened || 0,
        total_comments: collection.comments || 0,
      };

      // populate timeline metrics: average, median, percentile (raw minutes)
      timelineKeys.forEach((k) => {
        const avg = (collection.average as any)?.[k];
        const med = (collection.median as any)?.[k];
        const pctv = (collection.percentile as any)?.[k];
        row[`avg_${k}`] = typeof avg === "number" ? formatMinutesDuration(avg) : "";
        row[`med_${k}`] = typeof med === "number" ? formatMinutesDuration(med) : "";
        row[`pct${pct}_${k}`] = typeof pctv === "number" ? formatMinutesDuration(pctv) : "";
      });

      rows.push(flattenRow(row, headers));
    }
  }

  return rows.join("\n");
};

export default createTSV;
