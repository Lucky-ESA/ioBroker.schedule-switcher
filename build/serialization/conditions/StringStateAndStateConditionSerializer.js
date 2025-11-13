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
var StringStateAndStateConditionSerializer_exports = {};
__export(StringStateAndStateConditionSerializer_exports, {
  StringStateAndStateConditionSerializer: () => StringStateAndStateConditionSerializer
});
module.exports = __toCommonJS(StringStateAndStateConditionSerializer_exports);
var import_StringStateAndStateCondition = require("../../actions/conditions/StringStateAndStateCondition");
var import_EqualitySign = require("../../types/EqualitySign");
class StringStateAndStateConditionSerializer {
  /**
   * @param stateService StateService
   */
  constructor(stateService) {
    this.stateService = stateService;
  }
  /**
   * Deserialize
   *
   * @param stringToDeserialize Condition
   */
  deserialize(stringToDeserialize) {
    const json = JSON.parse(stringToDeserialize);
    if (json.type !== this.getType()) {
      throw new Error(`Can not deserialize object of type ${json.type}`);
    }
    if (!Object.values(import_EqualitySign.EqualitySign).includes(json.sign)) {
      throw new Error(`Equality sign ${json.sign} unknown`);
    }
    return new import_StringStateAndStateCondition.StringStateAndStateCondition(json.stateId1, json.stateId2, json.sign, this.stateService);
  }
  /**
   * Serialize
   *
   * @param objectToSerialize Condition
   */
  serialize(objectToSerialize) {
    if (objectToSerialize == null) {
      throw new Error("objectToSerialize may not be null or undefined.");
    }
    if (objectToSerialize instanceof import_StringStateAndStateCondition.StringStateAndStateCondition) {
      return JSON.stringify({
        type: this.getType(),
        stateId1: objectToSerialize.getStateId1(),
        stateId2: objectToSerialize.getStateId2(),
        sign: objectToSerialize.getSign()
      });
    }
    throw new Error("objectToSerialize must be of type StringStateAndStateCondition .");
  }
  /**
   * getType
   *
   * @returns Constructor name
   */
  getType() {
    return import_StringStateAndStateCondition.StringStateAndStateCondition.prototype.constructor.name;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StringStateAndStateConditionSerializer
});
//# sourceMappingURL=StringStateAndStateConditionSerializer.js.map
