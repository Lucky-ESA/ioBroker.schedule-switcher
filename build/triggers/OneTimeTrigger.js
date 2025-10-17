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
var OneTimeTrigger_exports = {};
__export(OneTimeTrigger_exports, {
  OneTimeTrigger: () => OneTimeTrigger
});
module.exports = __toCommonJS(OneTimeTrigger_exports);
class OneTimeTrigger {
  id;
  objectId;
  valueCheck;
  timedate;
  action;
  date;
  onDestroy;
  /**
   * @param id ID
   * @param objectId Object ID
   * @param valueCheck check value true/false
   * @param timedate Date
   * @param action Action
   * @param date Date
   * @param onDestroy Destroy
   */
  constructor(id, objectId, valueCheck, timedate, action, date, onDestroy) {
    if (id == null) {
      throw new Error("Id may not be null or undefined.");
    }
    if (action == null) {
      throw new Error("Action may not be null or undefined.");
    }
    if (date == null) {
      throw new Error("Date may not be null or undefined.");
    }
    this.id = id;
    this.objectId = objectId;
    this.valueCheck = valueCheck;
    this.timedate = timedate;
    this.action = action;
    this.date = new Date(date);
    this.onDestroy = onDestroy;
  }
  /**
   * getAction
   */
  getAction() {
    return {
      execute: (trigger) => {
        this.action.execute(trigger);
        this.destroy();
      }
    };
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
   * @returns ID
   */
  getId() {
    return this.id;
  }
  /**
   * @returns date
   */
  getDate() {
    return new Date(this.date);
  }
  /**
   * @returns objectid
   */
  getObjectId() {
    return this.objectId;
  }
  /**
   * @returns valueCheck
   */
  getValueCheck() {
    return this.valueCheck;
  }
  /**
   * @returns time
   */
  getTimeDate() {
    return this.timedate;
  }
  /**
   * getData
   */
  getData() {
    return {
      id: this.getId(),
      objectId: this.getObjectId(),
      valueCheck: this.getValueCheck(),
      timedate: this.getTimeDate(),
      date: this.getDate().toISOString(),
      trigger: "OneTimeTrigger"
    };
  }
  /**
   * @returns string
   */
  toString() {
    return `OneTimeTrigger {id=${this.getId()}, date=${this.getDate().toISOString()}, timedate=${this.getTimeDate()}, valueCheck=${this.getValueCheck()}, objectId=${this.getObjectId()}}`;
  }
  /**
   * @returns action
   */
  getInternalAction() {
    return this.action;
  }
  /**
   * Destroy all
   */
  destroy() {
    if (this.onDestroy) {
      this.onDestroy();
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OneTimeTrigger
});
//# sourceMappingURL=OneTimeTrigger.js.map
