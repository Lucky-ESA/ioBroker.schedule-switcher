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
var TimeTrigger_exports = {};
__export(TimeTrigger_exports, {
  TimeTrigger: () => TimeTrigger
});
module.exports = __toCommonJS(TimeTrigger_exports);
var import_BaseDailyTrigger = require("./BaseDailyTrigger");
class TimeTrigger extends import_BaseDailyTrigger.BaseDailyTrigger {
  hours;
  minutes;
  objectId;
  todayTrigger;
  constructor(id, hour, minute, objectId, weekdays, action, todayTrigger) {
    super(id, action, weekdays);
    this.hours = hour;
    this.minutes = minute;
    this.objectId = objectId;
    this.todayTrigger = todayTrigger;
  }
  getHour() {
    return this.hours;
  }
  getMinute() {
    return this.minutes;
  }
  getObjectId() {
    return this.objectId;
  }
  getTodayTrigger() {
    return this.todayTrigger;
  }
  getData() {
    return {
      id: this.getId(),
      hour: this.getHour(),
      minute: this.getMinute(),
      objectId: this.getObjectId(),
      weekdays: [this.getWeekdays()],
      trigger: "TimeTrigger",
      todayTrigger: this.getTodayTrigger()
    };
  }
  toString() {
    return `TimeTrigger {id=${this.getId()}, objectId=${this.getObjectId()}, todayTrigger=${JSON.stringify(this.getTodayTrigger())}, hour=${this.getHour()}, minute=${this.getMinute()}, weekdays=[${this.getWeekdays()}]}`;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TimeTrigger
});
//# sourceMappingURL=TimeTrigger.js.map
