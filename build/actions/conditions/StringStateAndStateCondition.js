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
var StringStateAndStateCondition_exports = {};
__export(StringStateAndStateCondition_exports, {
  StringStateAndStateCondition: () => StringStateAndStateCondition
});
module.exports = __toCommonJS(StringStateAndStateCondition_exports);
var import_EqualitySign = require("./EqualitySign");
class StringStateAndStateCondition {
  stateId1;
  stateId2;
  stateService;
  sign;
  /**
   * @param stateId1 ID 1
   * @param stateId2 ID 2
   * @param sign Sign
   * @param stateService setState
   */
  constructor(stateId1, stateId2, sign, stateService) {
    if (stateId1 == null || stateId1.length === 0) {
      throw new Error("First state id may not be null, undefined or empty.");
    }
    if (stateId2 == null || stateId2.length === 0) {
      throw new Error("Second state id may not be null, undefined or empty.");
    }
    if (sign == null) {
      throw new Error("Sign may not be null or undefined.");
    }
    if (stateService == null) {
      throw new Error("State service may not be null or undefined.");
    }
    this.stateId1 = stateId1;
    this.stateId2 = stateId2;
    this.sign = sign;
    this.stateService = stateService;
  }
  /**
   * evaluate
   */
  async evaluate() {
    const firstStateValue = String(await this.stateService.getForeignState(this.stateId1));
    const secondStateValue = String(await this.stateService.getForeignState(this.stateId2));
    let result;
    if (this.sign == import_EqualitySign.EqualitySign.NotEqual) {
      result = firstStateValue !== secondStateValue;
    } else {
      result = firstStateValue === secondStateValue;
    }
    return Promise.resolve(result);
  }
  /**
   * getStateId1
   */
  getStateId1() {
    return this.stateId1;
  }
  /**
   * getStateId2
   */
  getStateId2() {
    return this.stateId2;
  }
  /**
   * getSign
   */
  getSign() {
    return this.sign;
  }
  /**
   * toString
   */
  toString() {
    return `${this.stateId1} ${this.sign} ${this.stateId2}`;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StringStateAndStateCondition
});
//# sourceMappingURL=StringStateAndStateCondition.js.map
