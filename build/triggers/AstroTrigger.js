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
var AstroTrigger_exports = {};
__export(AstroTrigger_exports, {
  AstroTrigger: () => AstroTrigger
});
module.exports = __toCommonJS(AstroTrigger_exports);
var import_BaseDailyTrigger = require("./BaseDailyTrigger");
class AstroTrigger extends import_BaseDailyTrigger.BaseDailyTrigger {
  astroTime;
  shiftInMinutes;
  objectId;
  valueCheck;
  todayTrigger;
  /**
   *
   * @param id ID
   * @param astroTime Astrotime
   * @param shiftInMinutes Shift
   * @param weekdays Weekdays
   * @param action Action
   * @param objectId ObjectId
   * @param valueCheck check value true/false
   * @param todayTrigger Trigger
   */
  constructor(id, astroTime, shiftInMinutes, weekdays, action, objectId, valueCheck, todayTrigger) {
    super(id, action, weekdays);
    this.astroTime = astroTime;
    this.shiftInMinutes = shiftInMinutes;
    this.objectId = objectId;
    this.valueCheck = valueCheck;
    this.todayTrigger = todayTrigger;
  }
  /**
   * getAstroTime
   */
  getAstroTime() {
    return this.astroTime;
  }
  /**
   * getData
   */
  getData() {
    return {
      id: this.getId(),
      astroTime: this.getAstroTime(),
      shift: this.getShiftInMinutes(),
      todayTriger: this.getTodayTrigger(),
      objectId: this.getObjectId(),
      valueCheck: this.getValueCheck(),
      weekdays: this.getWeekdays(),
      trigger: "AstroTrigger"
    };
  }
  /**
   * @returns this
   */
  getObjectId() {
    return this.objectId;
  }
  /**
   * @returns this
   */
  getValueCheck() {
    return this.valueCheck;
  }
  /**
   * @returns this
   */
  getTodayTrigger() {
    return this.todayTrigger;
  }
  /**
   * @returns this
   */
  getShiftInMinutes() {
    return this.shiftInMinutes;
  }
  /**
   * toString
   */
  toString() {
    return `AstroTrigger {id=${this.getId()}, objectId=${this.getObjectId()}, valueCheck=${this.getValueCheck()}, todayTrigger=${JSON.stringify(this.getTodayTrigger())}, astroTime=${this.getAstroTime()}, shift=${this.getShiftInMinutes()}, weekdays=[${this.getWeekdays()}]}`;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AstroTrigger
});
//# sourceMappingURL=AstroTrigger.js.map
