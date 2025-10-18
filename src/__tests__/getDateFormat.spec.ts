import { getDateFormat } from "../common/utils/getDateFormat";
import * as coreUtils from "../common/utils/getValueAsIs";

describe("getDateFormat", () => {
  it("returns week format when PERIOD_SPLIT_UNIT is week", () => {
    jest.spyOn(coreUtils, "getValueAsIs").mockReturnValue("week");
    const fmt = getDateFormat();
  expect(fmt).toBe("W/y");
  });
});
