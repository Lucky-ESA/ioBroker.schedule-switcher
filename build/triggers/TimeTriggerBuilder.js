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
  setHour(hour) {
    this.hour = hour;
    return this;
  }
  setMinute(minute) {
    this.minute = minute;
    return this;
  }
  setObjectId(objectId) {
    this.objectId = objectId;
    return this;
  }
  setTodayTrigger(todayTrigger) {
    this.todayTrigger = todayTrigger;
    return this;
  }
  setAction(action) {
    super.setAction(action);
    return this;
  }
  setId(id) {
    super.setId(id);
    return this;
  }
  setWeekdays(weekdays) {
    super.setWeekdays(weekdays);
    return this;
  }
  build() {
    return new import_TimeTrigger.TimeTrigger(
      this.getId(),
      this.hour,
      this.minute,
      this.objectId,
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
