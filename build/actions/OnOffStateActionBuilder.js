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
  setIdsOfStatesToSet(idsOfStatesToSet) {
    this.idsOfStatesToSet = idsOfStatesToSet;
    return this;
  }
  setOnValue(onValue) {
    this.onValue = onValue;
    return this;
  }
  setOffValue(offValue) {
    this.offValue = offValue;
    return this;
  }
  setBooleanValue(booleanValue) {
    this.booleanValue = booleanValue;
    return this;
  }
  setStateService(stateService) {
    super.setStateService(stateService);
    return this;
  }
  build() {
    return new import_OnOffStateAction.OnOffStateAction(
      this.idsOfStatesToSet,
      this.onValue,
      this.offValue,
      this.booleanValue,
      this.stateService
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OnOffStateActionBuilder
});
//# sourceMappingURL=OnOffStateActionBuilder.js.map
