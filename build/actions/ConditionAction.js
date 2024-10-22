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
var ConditionAction_exports = {};
__export(ConditionAction_exports, {
  ConditionAction: () => ConditionAction
});
module.exports = __toCommonJS(ConditionAction_exports);
class ConditionAction {
  constructor(condition, action, adapter) {
    this.adapter = adapter;
    if (condition == null) {
      this.adapter.log.error("condition may not be null or undefined");
    }
    if (action == null) {
      this.adapter.log.error("action may not be null or undefined");
    }
    this.condition = condition;
    this.action = action;
  }
  condition;
  action;
  getAction() {
    return this.action;
  }
  setAction(action) {
    if (action == null) {
      this.adapter.log.error("action may not be null or undefined");
      return;
    }
    this.action = action;
  }
  getCondition() {
    return this.condition;
  }
  execute() {
    this.condition.evaluate().then((result) => {
      if (result) {
        this.adapter.log.debug(`Executing action because condition ${this.condition} evaluated to true`);
        this.action.execute(false);
      } else {
        this.adapter.log.debug(
          `Not executing action because condition ${this.condition} evaluated to false`
        );
      }
    }).catch((e) => {
      this.adapter.log.error(`Error while evaluating condition: ${this.condition} - ${e}`);
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConditionAction
});
//# sourceMappingURL=ConditionAction.js.map
