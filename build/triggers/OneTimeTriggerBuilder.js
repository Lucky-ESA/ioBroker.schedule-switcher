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
var OneTimeTriggerBuilder_exports = {};
__export(OneTimeTriggerBuilder_exports, {
  OneTimeTriggerBuilder: () => OneTimeTriggerBuilder
});
module.exports = __toCommonJS(OneTimeTriggerBuilder_exports);
var import_OneTimeTrigger = require("./OneTimeTrigger");
class OneTimeTriggerBuilder {
  action = null;
  id = "0";
  objectId = 0;
  valueCheck = false;
  timedate = false;
  date = null;
  onDestroy = null;
  /**
   * @param action Action
   * @returns this
   */
  setAction(action) {
    this.action = action;
    return this;
  }
  /**
   * @param id ID
   * @returns this
   */
  setId(id) {
    this.id = id;
    return this;
  }
  /**
   * @param date Date
   * @returns this
   */
  setDate(date) {
    this.date = date;
    return this;
  }
  /**
   * @param objectId ID
   * @returns this
   */
  setObjectId(objectId) {
    this.objectId = objectId;
    return this;
  }
  /**
   * @param valueCheck value check true/false
   * @returns this
   */
  setValueCheck(valueCheck) {
    this.valueCheck = valueCheck;
    return this;
  }
  /**
   * @param timedate Time
   * @returns this
   */
  setTimeDate(timedate) {
    this.timedate = timedate;
    return this;
  }
  /**
   * @param onDestroy Destroy
   * @returns this
   */
  setOnDestroy(onDestroy) {
    this.onDestroy = onDestroy;
    return this;
  }
  /**
   * @returns OneTimeTrigger
   */
  build() {
    return new import_OneTimeTrigger.OneTimeTrigger(
      this.id,
      this.objectId,
      this.valueCheck,
      this.timedate,
      this.action,
      this.date,
      this.onDestroy
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OneTimeTriggerBuilder
});
//# sourceMappingURL=OneTimeTriggerBuilder.js.map
