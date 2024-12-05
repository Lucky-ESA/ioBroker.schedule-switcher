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
var StringStateAndConstantCondition_exports = {};
__export(StringStateAndConstantCondition_exports, {
  StringStateAndConstantCondition: () => StringStateAndConstantCondition
});
module.exports = __toCommonJS(StringStateAndConstantCondition_exports);
var import_EqualitySign = require("./EqualitySign");
class StringStateAndConstantCondition {
  constant;
  stateId;
  stateService;
  sign;
  /**
   * @param constant Constant
   * @param stateId ID
   * @param sign Sign
   * @param stateService setState
   */
  constructor(constant, stateId, sign, stateService) {
    if (constant == null) {
      throw new Error("Constant value may not be null or undefined.");
    }
    if (stateId == null || stateId.length === 0) {
      throw new Error("State id may not be null, undefined or empty.");
    }
    if (sign == null) {
      throw new Error("Sign may not be null or undefined.");
    }
    if (stateService == null) {
      throw new Error("State service may not be null or undefined.");
    }
    this.constant = constant;
    this.stateId = stateId;
    this.sign = sign;
    this.stateService = stateService;
  }
  /**
   * evaluate
   */
  async evaluate() {
    const stateValue = String(await this.stateService.getForeignState(this.stateId));
    let result;
    if (this.sign == import_EqualitySign.EqualitySign.NotEqual) {
      result = stateValue !== this.constant;
    } else {
      result = stateValue === this.constant;
    }
    return Promise.resolve(result);
  }
  /**
   * getConstant
   */
  getConstant() {
    return this.constant;
  }
  /**
   * getStateId
   */
  getStateId() {
    return this.stateId;
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
    return `${this.constant} ${this.sign} ${this.stateId}`;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StringStateAndConstantCondition
});
//# sourceMappingURL=StringStateAndConstantCondition.js.map
