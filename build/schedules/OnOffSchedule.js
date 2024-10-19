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
var OnOffSchedule_exports = {};
__export(OnOffSchedule_exports, {
  OnOffSchedule: () => OnOffSchedule
});
module.exports = __toCommonJS(OnOffSchedule_exports);
var import_ConditionAction = require("../actions/ConditionAction");
var import_OnOffStateAction = require("../actions/OnOffStateAction");
var import_Schedule = require("./Schedule");
class OnOffSchedule extends import_Schedule.Schedule {
  onAction;
  offAction;
  constructor(onAction, offAction, triggerScheduler) {
    super(triggerScheduler);
    if (onAction == null) {
      throw new Error(`onAction may not be null or undefined`);
    }
    if (offAction == null) {
      throw new Error(`offAction may not be null or undefined`);
    }
    this.onAction = onAction;
    this.offAction = offAction;
  }
  setOnAction(onAction) {
    if (onAction == null) {
      throw new Error(`onAction may not be null or undefined`);
    }
    this.onAction = onAction;
    this.getTriggers().forEach((t) => {
      const action = t.getAction();
      if (action instanceof import_OnOffStateAction.OnOffStateAction) {
        if (action.getBooleanValue()) {
          t.setAction(onAction);
        }
      } else if (action instanceof import_ConditionAction.ConditionAction) {
        const decoratedAction = action.getAction();
        if (decoratedAction instanceof import_OnOffStateAction.OnOffStateAction) {
          if (decoratedAction.getBooleanValue()) {
            action.setAction(onAction);
          }
        }
      }
    });
  }
  setOffAction(offAction) {
    if (offAction == null) {
      throw new Error(`offAction may not be null or undefined`);
    }
    this.offAction = offAction;
    this.getTriggers().forEach((t) => {
      const action = t.getAction();
      if (action instanceof import_OnOffStateAction.OnOffStateAction) {
        if (!action.getBooleanValue()) {
          t.setAction(offAction);
        }
      } else if (action instanceof import_ConditionAction.ConditionAction) {
        const decoratedAction = action.getAction();
        if (decoratedAction instanceof import_OnOffStateAction.OnOffStateAction) {
          if (!decoratedAction.getBooleanValue()) {
            action.setAction(offAction);
          }
        }
      }
    });
  }
  getOnAction() {
    return this.onAction;
  }
  getOffAction() {
    return this.offAction;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OnOffSchedule
});
//# sourceMappingURL=OnOffSchedule.js.map
