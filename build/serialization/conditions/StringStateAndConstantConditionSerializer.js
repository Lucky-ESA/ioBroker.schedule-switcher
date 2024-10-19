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
var StringStateAndConstantConditionSerializer_exports = {};
__export(StringStateAndConstantConditionSerializer_exports, {
  StringStateAndConstantConditionSerializer: () => StringStateAndConstantConditionSerializer
});
module.exports = __toCommonJS(StringStateAndConstantConditionSerializer_exports);
var import_EqualitySign = require("../../actions/conditions/EqualitySign");
var import_StringStateAndConstantCondition = require("../../actions/conditions/StringStateAndConstantCondition");
class StringStateAndConstantConditionSerializer {
  constructor(stateService) {
    this.stateService = stateService;
  }
  deserialize(stringToDeserialize) {
    const json = JSON.parse(stringToDeserialize);
    if (json.type !== this.getType()) {
      throw new Error(`Can not deserialize object of type ${json.type}`);
    }
    if (!Object.values(import_EqualitySign.EqualitySign).includes(json.sign)) {
      throw new Error(`Equality sign ${json.sign} unknown`);
    }
    return new import_StringStateAndConstantCondition.StringStateAndConstantCondition(json.constant, json.stateId, json.sign, this.stateService);
  }
  serialize(objectToSerialize) {
    if (objectToSerialize == null) {
      throw new Error("objectToSerialize may not be null or undefined.");
    }
    if (objectToSerialize instanceof import_StringStateAndConstantCondition.StringStateAndConstantCondition) {
      return JSON.stringify({
        type: this.getType(),
        constant: objectToSerialize.getConstant(),
        stateId: objectToSerialize.getStateId(),
        sign: objectToSerialize.getSign()
      });
    } else {
      throw new Error("objectToSerialize must be of type StringStateAndConstantCondition .");
    }
  }
  getType() {
    return import_StringStateAndConstantCondition.StringStateAndConstantCondition.prototype.constructor.name;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StringStateAndConstantConditionSerializer
});
//# sourceMappingURL=StringStateAndConstantConditionSerializer.js.map
