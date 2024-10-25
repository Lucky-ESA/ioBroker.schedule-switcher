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
var OnOffStateActionSerializer_exports = {};
__export(OnOffStateActionSerializer_exports, {
  OnOffStateActionSerializer: () => OnOffStateActionSerializer
});
module.exports = __toCommonJS(OnOffStateActionSerializer_exports);
var import_OnOffStateAction = require("../actions/OnOffStateAction");
var import_OnOffStateActionBuilder = require("../actions/OnOffStateActionBuilder");
class OnOffStateActionSerializer {
  builder;
  constructor(stateService) {
    this.builder = new import_OnOffStateActionBuilder.OnOffStateActionBuilder();
    this.builder.setStateService(stateService);
  }
  deserialize(stringToDeserialize) {
    const json = JSON.parse(stringToDeserialize);
    if (json.type !== this.getType()) {
      throw new Error(`Can not deserialize object of type ${json.type}`);
    }
    if (!this.hasCorrectValueType(json)) {
      throw new Error(`Can not deserialize OnOffStateAction with value type ${json.valueType}`);
    }
    return this.builder.setOffValue(json.offValue).setOnValue(json.onValue).setBooleanValue(json.booleanValue).setIdsOfStatesToSet(json.idsOfStatesToSet).setValueType(json.valueType).build();
  }
  serialize(objectToSerialize) {
    if (objectToSerialize == null) {
      throw new Error("objectToSerialize may not be null or undefined.");
    }
    if (objectToSerialize instanceof import_OnOffStateAction.OnOffStateAction) {
      return JSON.stringify({
        type: this.getType(),
        valueType: typeof objectToSerialize.getOnValue(),
        onValue: objectToSerialize.getOnValue(),
        offValue: objectToSerialize.getOffValue(),
        booleanValue: objectToSerialize.getBooleanValue(),
        idsOfStatesToSet: objectToSerialize.getIdsOfStatesToSet()
      });
    } else {
      throw new Error("objectToSerialize must be of type OnOffStateAction.");
    }
  }
  getType() {
    return import_OnOffStateAction.OnOffStateAction.prototype.constructor.name;
  }
  hasCorrectValueType(json) {
    return ["string", "number", "boolean"].indexOf(json.valueType) != -1;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OnOffStateActionSerializer
});
//# sourceMappingURL=OnOffStateActionSerializer.js.map
