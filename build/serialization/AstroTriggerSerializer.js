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
var AstroTriggerSerializer_exports = {};
__export(AstroTriggerSerializer_exports, {
  AstroTriggerSerializer: () => AstroTriggerSerializer
});
module.exports = __toCommonJS(AstroTriggerSerializer_exports);
var import_AstroTrigger = require("../triggers/AstroTrigger");
var import_AstroTriggerBuilder = require("../triggers/AstroTriggerBuilder");
class AstroTriggerSerializer {
  /**
   * @param actionSerializer UniversalSerializer
   */
  constructor(actionSerializer) {
    this.actionSerializer = actionSerializer;
  }
  /**
   * Deserialize
   *
   * @param stringToDeserialize Trigger
   * @returns AstroTrigger
   */
  deserialize(stringToDeserialize) {
    const json = JSON.parse(stringToDeserialize);
    if (json.type !== this.getType()) {
      throw new Error(`Can not deserialize object of type ${json.type}`);
    }
    return new import_AstroTriggerBuilder.AstroTriggerBuilder().setAction(this.actionSerializer.deserialize(JSON.stringify(json.action))).setAstroTime(json.astroTime).setShift(json.shiftInMinutes).setObjectId(json.objectId).setValueCheck(json.valueCheck).setTodayTrigger(json.todayTrigger).setWeekdays(json.weekdays).setId(json.id).build();
  }
  /**
   * Serialize
   *
   * @param objectToSerialize Trigger
   * @returns astro trigger or crash adapter
   */
  serialize(objectToSerialize) {
    if (objectToSerialize == null) {
      throw new Error("objectToSerialize may not be null or undefined.");
    }
    if (objectToSerialize instanceof import_AstroTrigger.AstroTrigger) {
      return JSON.stringify({
        type: this.getType(),
        astroTime: objectToSerialize.getAstroTime(),
        shiftInMinutes: objectToSerialize.getShiftInMinutes(),
        weekdays: objectToSerialize.getWeekdays(),
        objectId: objectToSerialize.getObjectId(),
        valueCheck: objectToSerialize.getValueCheck(),
        id: objectToSerialize.getId(),
        action: JSON.parse(this.actionSerializer.serialize(objectToSerialize.getAction())),
        todayTrigger: objectToSerialize.getTodayTrigger()
      });
    }
    throw new Error("objectToSerialize must be of type AstroTrigger.");
  }
  /**
   * getType
   *
   * @returns action on/off
   */
  getType() {
    return import_AstroTrigger.AstroTrigger.prototype.constructor.name;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AstroTriggerSerializer
});
//# sourceMappingURL=AstroTriggerSerializer.js.map
