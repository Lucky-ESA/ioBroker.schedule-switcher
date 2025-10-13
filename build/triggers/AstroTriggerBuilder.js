"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var AstroTriggerBuilder_exports = {};
__export(AstroTriggerBuilder_exports, {
  AstroTriggerBuilder: () => AstroTriggerBuilder
});
module.exports = __toCommonJS(AstroTriggerBuilder_exports);
var import_AstroTrigger = require("./AstroTrigger");
var import_DailyTriggerBuilder = require("./DailyTriggerBuilder");
class AstroTriggerBuilder extends import_DailyTriggerBuilder.DailyTriggerBuilder {
  astroTime = null;
  shift = 0;
  objectId = 0;
  valueCheck = false;
  todayTrigger = {};
  /**
   * @param astroTime AstroTime
   */
  setAstroTime(astroTime) {
    this.astroTime = astroTime;
    return this;
  }
  /**
   * @param shift shiftminutes
   */
  setShift(shift) {
    this.shift = shift;
    return this;
  }
  /**
   * @param objectId Object ID
   * @returns this
   */
  setObjectId(objectId) {
    this.objectId = objectId;
    return this;
  }
  /**
   * @param valueCheck check value true/false
   * @returns this
   */
  setValueCheck(valueCheck) {
    this.valueCheck = valueCheck;
    return this;
  }
  /**
   * @param todayTrigger trigger
   * @returns this
   */
  setTodayTrigger(todayTrigger) {
    this.todayTrigger = todayTrigger;
    return this;
  }
  /**
   * @param action Action
   * @returns this
   */
  setAction(action) {
    super.setAction(action);
    return this;
  }
  /**
   * @param id Trigger ID
   * @returns this
   */
  setId(id) {
    super.setId(id);
    return this;
  }
  /**
   * @param weekdays Weekdays
   * @returns this
   */
  setWeekdays(weekdays) {
    super.setWeekdays(weekdays);
    return this;
  }
  /**
   * @returns build
   */
  build() {
    return new import_AstroTrigger.AstroTrigger(
      this.getId(),
      this.astroTime,
      this.shift,
      this.getWeekdays(),
      this.getAction(),
      this.objectId,
      this.valueCheck,
      this.todayTrigger
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AstroTriggerBuilder
});
//# sourceMappingURL=AstroTriggerBuilder.js.map
