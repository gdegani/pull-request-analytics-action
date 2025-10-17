import { Collection } from "../converters";

const flattenRow = (row: Record<string, any>, headers: string[]) =>
  headers.map((h) => (row[h] === undefined || row[h] === null ? "" : String(row[h]))).join("\t");

export const createTSV = (
  data: Record<string, Record<string, Collection>>,
  users: string[],
  dates: string[]
) => {
  // Produce a simple TSV: header row then one row per user per date with some basic metrics
  const headers = ["date", "user", "total_merged", "total_opened", "total_comments"];
  const rows: string[] = [];
  rows.push(headers.join("\t"));

  for (const date of dates) {
    for (const user of users) {
      // `data` is shaped as data[user][date] = Collection, with a special 'total' key
      const collection = data[user]?.[date] || ({} as any);
      const row: Record<string, any> = {
        date,
        user,
        total_merged: collection.merged || 0,
        total_opened: collection.opened || 0,
        total_comments: collection.comments || 0,
      };
      rows.push(flattenRow(row, headers));
    }
  }

  return rows.join("\n");
};

export default createTSV;
