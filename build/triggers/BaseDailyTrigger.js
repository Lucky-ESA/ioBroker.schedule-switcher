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
var BaseDailyTrigger_exports = {};
__export(BaseDailyTrigger_exports, {
  BaseDailyTrigger: () => BaseDailyTrigger
});
module.exports = __toCommonJS(BaseDailyTrigger_exports);
class BaseDailyTrigger {
  weekdays;
  id;
  action;
  constructor(id, action, weekdays) {
    if (id == null) {
      throw new Error("Id may not be null or undefined.");
    }
    if (action == null) {
      throw new Error("Action may not be null or undefined.");
    }
    this.checkWeekdays(weekdays);
    this.weekdays = weekdays;
    this.action = action;
    this.id = id;
  }
  /**
   * getWeekdays
   *
   * @returns weekdays
   */
  getWeekdays() {
    return this.weekdays;
  }
  /**
   * getAction
   *
   * @returns action
   */
  getAction() {
    return this.action;
  }
  /**
   * @param action Action
   */
  setAction(action) {
    if (action == null) {
      throw new Error("Action may not be null or undefined.");
    }
    this.action = action;
  }
  /**
   * getId
   *
   * @returns ID
   */
  getId() {
    return this.id;
  }
  /**
   * checkWeekdays
   *
   * @param weekdays check array or crash adapter
   */
  checkWeekdays(weekdays) {
    if (weekdays == null) {
      throw new Error("Weekdays may not be null or undefined.");
    }
    if (weekdays.length <= 0 || weekdays.length > 7) {
      throw new Error("Weekdays length must be in range 1-7.");
    }
    if (this.hasDuplicates(weekdays)) {
      throw new Error("Weekdays may not contain duplicates.");
    }
  }
  /**
   * hasDuplicates
   *
   * @param weekdays array
   * @returns array weekdays
   */
  hasDuplicates(weekdays) {
    return new Set(weekdays).size !== weekdays.length;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BaseDailyTrigger
});
//# sourceMappingURL=BaseDailyTrigger.js.map
