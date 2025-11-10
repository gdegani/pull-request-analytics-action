import { calcPRsize } from "./calcPRsize";
import { getValueAsIs } from "../../../common/utils";

export type PullRequestSize = "xs" | "s" | "m" | "l" | "xl";

export const getPullRequestSize = (
  additions: number | undefined,
  deletions: number | undefined
): PullRequestSize => {
  const size = calcPRsize(additions, deletions);
  const xsThreshold = parseFloat(getValueAsIs("SIZE_XS_THRESHOLD") || "50");
  const sThreshold = parseFloat(getValueAsIs("SIZE_S_THRESHOLD") || "200");
  const mThreshold = parseFloat(getValueAsIs("SIZE_M_THRESHOLD") || "400");
  const lThreshold = parseFloat(getValueAsIs("SIZE_L_THRESHOLD") || "700");
  
  if (size <= xsThreshold) {
    return "xs";
  }
  if (size <= sThreshold) {
    return "s";
  }
  if (size <= mThreshold) {
    return "m";
  }
  if (size <= lThreshold) {
    return "l";
  }
  return "xl";
};
