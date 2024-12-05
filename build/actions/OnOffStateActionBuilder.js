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
var OnOffStateActionBuilder_exports = {};
__export(OnOffStateActionBuilder_exports, {
  OnOffStateActionBuilder: () => OnOffStateActionBuilder
});
module.exports = __toCommonJS(OnOffStateActionBuilder_exports);
var import_BaseStateActionBuilder = require("./BaseStateActionBuilder");
var import_OnOffStateAction = require("./OnOffStateAction");
class OnOffStateActionBuilder extends import_BaseStateActionBuilder.BaseStateActionBuilder {
  idsOfStatesToSet = [];
  onValue = null;
  offValue = null;
  booleanValue = true;
  valueType = "";
  /**
   * @param idsOfStatesToSet States
   */
  setIdsOfStatesToSet(idsOfStatesToSet) {
    this.idsOfStatesToSet = idsOfStatesToSet;
    return this;
  }
  /**
   * @param onValue on
   */
  setOnValue(onValue) {
    this.onValue = onValue;
    return this;
  }
  /**
   * @param offValue off
   */
  setOffValue(offValue) {
    this.offValue = offValue;
    return this;
  }
  /**
   * @param booleanValue value
   */
  setBooleanValue(booleanValue) {
    this.booleanValue = booleanValue;
    return this;
  }
  /**
   * @param valueType set type
   */
  setValueType(valueType) {
    this.valueType = valueType;
    return this;
  }
  /**
   * @param stateService setState
   */
  setStateService(stateService) {
    super.setStateService(stateService);
    return this;
  }
  /**
   * OnOffStateAction
   */
  build() {
    return new import_OnOffStateAction.OnOffStateAction(
      this.idsOfStatesToSet,
      this.onValue,
      this.offValue,
      this.booleanValue,
      this.stateService,
      this.valueType
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OnOffStateActionBuilder
});
//# sourceMappingURL=OnOffStateActionBuilder.js.map
