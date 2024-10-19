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
var TimeTriggerSerializer_exports = {};
__export(TimeTriggerSerializer_exports, {
  TimeTriggerSerializer: () => TimeTriggerSerializer
});
module.exports = __toCommonJS(TimeTriggerSerializer_exports);
var import_TimeTrigger = require("../triggers/TimeTrigger");
var import_TimeTriggerBuilder = require("../triggers/TimeTriggerBuilder");
class TimeTriggerSerializer {
  constructor(actionSerializer) {
    this.actionSerializer = actionSerializer;
  }
  deserialize(stringToDeserialize) {
    const json = JSON.parse(stringToDeserialize);
    if (json.type !== this.getType()) {
      throw new Error(`Can not deserialize object of type ${json.type}`);
    }
    return new import_TimeTriggerBuilder.TimeTriggerBuilder().setAction(this.actionSerializer.deserialize(JSON.stringify(json.action))).setHour(json.hour).setMinute(json.minute).setWeekdays(json.weekdays).setId(json.id).build();
  }
  serialize(objectToSerialize) {
    if (objectToSerialize == null) {
      throw new Error("objectToSerialize may not be null or undefined.");
    }
    if (objectToSerialize instanceof import_TimeTrigger.TimeTrigger) {
      return JSON.stringify({
        type: this.getType(),
        hour: objectToSerialize.getHour(),
        minute: objectToSerialize.getMinute(),
        weekdays: objectToSerialize.getWeekdays(),
        id: objectToSerialize.getId(),
        action: JSON.parse(this.actionSerializer.serialize(objectToSerialize.getAction()))
      });
    } else {
      throw new Error("objectToSerialize must be of type TimeTrigger.");
    }
  }
  getType() {
    return import_TimeTrigger.TimeTrigger.prototype.constructor.name;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TimeTriggerSerializer
});
//# sourceMappingURL=TimeTriggerSerializer.js.map
