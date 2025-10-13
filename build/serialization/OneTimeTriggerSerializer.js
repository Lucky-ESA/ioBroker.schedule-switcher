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
var OneTimeTriggerSerializer_exports = {};
__export(OneTimeTriggerSerializer_exports, {
  OneTimeTriggerSerializer: () => OneTimeTriggerSerializer
});
module.exports = __toCommonJS(OneTimeTriggerSerializer_exports);
var import_OneTimeTrigger = require("../triggers/OneTimeTrigger");
var import_OneTimeTriggerBuilder = require("../triggers/OneTimeTriggerBuilder");
class OneTimeTriggerSerializer {
  /**
   * @param actionSerializer Serializer
   * @param deleteTrigger Trigger
   */
  constructor(actionSerializer, deleteTrigger) {
    this.actionSerializer = actionSerializer;
    this.deleteTrigger = deleteTrigger;
  }
  /**
   * @param stringToDeserialize Deserialize
   */
  deserialize(stringToDeserialize) {
    const json = JSON.parse(stringToDeserialize);
    if (json.type !== this.getType()) {
      throw new Error(`Can not deserialize object of type ${json.type}`);
    }
    return new import_OneTimeTriggerBuilder.OneTimeTriggerBuilder().setAction(this.actionSerializer.deserialize(JSON.stringify(json.action))).setDate(new Date(Date.parse(json.date))).setObjectId(json.objectId).setValueCheck(json.valueCheck).setTimeDate(json.timedate).setId(json.id).setOnDestroy(() => {
      if (this.deleteTrigger) {
        this.deleteTrigger(json.id);
      }
    }).build();
  }
  /**
   * @param objectToSerialize Serialize
   */
  serialize(objectToSerialize) {
    if (objectToSerialize == null) {
      throw new Error("objectToSerialize may not be null or undefined.");
    }
    if (objectToSerialize instanceof import_OneTimeTrigger.OneTimeTrigger) {
      return JSON.stringify({
        type: this.getType(),
        date: objectToSerialize.getDate().toISOString(),
        objectId: objectToSerialize.getObjectId(),
        valueCheck: objectToSerialize.getValueCheck(),
        timedate: objectToSerialize.getTimeDate(),
        id: objectToSerialize.getId(),
        action: JSON.parse(this.actionSerializer.serialize(objectToSerialize.getInternalAction()))
      });
    }
    throw new Error("objectToSerialize must be of type OneTimeTrigger.");
  }
  /**
   * getType
   */
  getType() {
    return import_OneTimeTrigger.OneTimeTrigger.prototype.constructor.name;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OneTimeTriggerSerializer
});
//# sourceMappingURL=OneTimeTriggerSerializer.js.map
