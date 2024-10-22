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
var OnOffStateAction_exports = {};
__export(OnOffStateAction_exports, {
  OnOffStateAction: () => OnOffStateAction
});
module.exports = __toCommonJS(OnOffStateAction_exports);
var import_BaseStateAction = require("./BaseStateAction");
class OnOffStateAction extends import_BaseStateAction.BaseStateAction {
  idsOfStatesToSet;
  onValue;
  offValue;
  booleanValue;
  constructor(idsOfStatesToSet, onValue, offValue, booleanValue, stateService) {
    super(stateService);
    this.checkIdsOfStates(idsOfStatesToSet);
    if (onValue == void 0) {
      throw new Error("OnValue may not be undefined.");
    }
    if (offValue == void 0) {
      throw new Error("OffValue may not be undefined.");
    }
    if (booleanValue == null) {
      throw new Error("ValueToSet may not be null or undefined.");
    }
    this.idsOfStatesToSet = idsOfStatesToSet;
    this.onValue = onValue;
    this.offValue = offValue;
    this.booleanValue = booleanValue;
  }
  getIdsOfStatesToSet() {
    return this.idsOfStatesToSet;
  }
  setIdsOfStatesToSet(idsOfStatesToSet) {
    this.checkIdsOfStates(idsOfStatesToSet);
    this.idsOfStatesToSet = idsOfStatesToSet;
  }
  getOnValue() {
    return this.onValue;
  }
  getOffValue() {
    return this.offValue;
  }
  getBooleanValue() {
    return this.booleanValue;
  }
  execute(trigger) {
    const valueToUse = this.getBooleanValue() ? this.getOnValue() : this.getOffValue();
    this.getIdsOfStatesToSet().forEach((id) => {
      this.getStateService().setForeignState(id, valueToUse, trigger);
    });
  }
  toBooleanValueType() {
    return new OnOffStateAction(
      this.getIdsOfStatesToSet(),
      true,
      false,
      this.getBooleanValue(),
      this.getStateService()
    );
  }
  toStringValueType(onValue, offValue) {
    return new OnOffStateAction(
      this.getIdsOfStatesToSet(),
      onValue,
      offValue,
      this.getBooleanValue(),
      this.getStateService()
    );
  }
  toNumberValueType(onValue, offValue) {
    return new OnOffStateAction(
      this.getIdsOfStatesToSet(),
      onValue,
      offValue,
      this.getBooleanValue(),
      this.getStateService()
    );
  }
  checkIdsOfStates(ids) {
    if (ids == null || ids.length == 0 || ids.includes("")) {
      throw new Error("IdsOfStatesToSet may not be null or empty.");
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OnOffStateAction
});
//# sourceMappingURL=OnOffStateAction.js.map
