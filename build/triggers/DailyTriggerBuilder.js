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
var DailyTriggerBuilder_exports = {};
__export(DailyTriggerBuilder_exports, {
  DailyTriggerBuilder: () => DailyTriggerBuilder
});
module.exports = __toCommonJS(DailyTriggerBuilder_exports);
class DailyTriggerBuilder {
  action = null;
  id = "0";
  weekdays = [];
  setAction(action) {
    this.action = action;
    return this;
  }
  setId(id) {
    this.id = id;
    return this;
  }
  setWeekdays(weekdays) {
    this.weekdays = weekdays;
    return this;
  }
  getAction() {
    return this.action;
  }
  getWeekdays() {
    return this.weekdays;
  }
  getId() {
    return this.id;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DailyTriggerBuilder
});
//# sourceMappingURL=DailyTriggerBuilder.js.map
