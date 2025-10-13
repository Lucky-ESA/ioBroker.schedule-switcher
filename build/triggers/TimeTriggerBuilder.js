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
var TimeTriggerBuilder_exports = {};
__export(TimeTriggerBuilder_exports, {
  TimeTriggerBuilder: () => TimeTriggerBuilder
});
module.exports = __toCommonJS(TimeTriggerBuilder_exports);
var import_DailyTriggerBuilder = require("./DailyTriggerBuilder");
var import_TimeTrigger = require("./TimeTrigger");
class TimeTriggerBuilder extends import_DailyTriggerBuilder.DailyTriggerBuilder {
  hour = 0;
  minute = 0;
  objectId = 0;
  todayTrigger = {};
  valueCheck = false;
  /**
   * @param hour Hour
   * @returns this
   */
  setHour(hour) {
    this.hour = hour;
    return this;
  }
  /**
   * @param minute Minute
   * @returns this
   */
  setMinute(minute) {
    this.minute = minute;
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
   * @param todayTrigger Trigger
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
   * @param id ID
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
   * TimeTrigger
   */
  build() {
    return new import_TimeTrigger.TimeTrigger(
      this.getId(),
      this.hour,
      this.minute,
      this.objectId,
      this.valueCheck,
      this.getWeekdays(),
      this.getAction(),
      this.todayTrigger
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TimeTriggerBuilder
});
//# sourceMappingURL=TimeTriggerBuilder.js.map
