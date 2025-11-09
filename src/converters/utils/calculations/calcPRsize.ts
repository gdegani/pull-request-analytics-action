import { getValueAsIs } from "../../../common/utils";

export const calcPRsize = (
  additions: number | undefined,
  deletions: number | undefined
) => {
  const deletionWeight = parseFloat(getValueAsIs("DELETION_WEIGHT") || "0.2");
  return (additions || 0) + (deletions || 0) * deletionWeight;
};
