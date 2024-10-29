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
  timedate;
  action;
  date;
  onDestroy;
  constructor(id, objectId, timedate, action, date, onDestroy) {
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
    this.timedate = timedate;
    this.action = action;
    this.date = new Date(date);
    this.onDestroy = onDestroy;
  }
  getAction() {
    return {
      execute: (trigger) => {
        this.action.execute(trigger);
        this.destroy();
      }
    };
  }
  setAction(action) {
    if (action == null) {
      throw new Error("Action may not be null or undefined.");
    }
    this.action = action;
  }
  getId() {
    return this.id;
  }
  getDate() {
    return new Date(this.date);
  }
  getObjectId() {
    return this.objectId;
  }
  getTimeDate() {
    return this.timedate;
  }
  getData() {
    return {
      id: this.getId(),
      objectId: this.getObjectId(),
      timedate: this.getTimeDate(),
      date: this.getDate().toISOString(),
      trigger: "OneTimeTrigger"
    };
  }
  toString() {
    return `OneTimeTrigger {id=${this.getId()}, date=${this.getDate().toISOString()}, timedate=${this.getTimeDate()}}`;
  }
  getInternalAction() {
    return this.action;
  }
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
