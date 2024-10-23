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
  nextTrigger;
  constructor(id, hour, minute, objectId, weekdays, action, nextTrigger) {
    super(id, action, weekdays);
    if (hour == void 0 || hour < 0 || hour > 23) {
      throw new Error("Hour must be in range 0-23.");
    }
    if (minute == void 0 || minute < 0 || minute > 59) {
      throw new Error("Minute must be in range 0-59.");
    }
    this.hours = hour;
    this.minutes = minute;
    this.objectId = objectId;
    this.nextTrigger = nextTrigger;
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
  getNextTrigger() {
    return this.nextTrigger;
  }
  getData() {
    return {
      id: this.getId(),
      hour: this.getHour(),
      minute: this.getMinute(),
      objectId: this.getObjectId(),
      weekdays: [this.getWeekdays()],
      trigger: "TimeTrigger",
      nextTrigger: this.getNextTrigger()
    };
  }
  toString() {
    return `TimeTrigger {id=${this.getId()}, nextEvent=${this.getNextTrigger()}, hour=${this.getHour()}, minute=${this.getMinute()}, weekdays=[${this.getWeekdays()}]}`;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TimeTrigger
});
//# sourceMappingURL=TimeTrigger.js.map
