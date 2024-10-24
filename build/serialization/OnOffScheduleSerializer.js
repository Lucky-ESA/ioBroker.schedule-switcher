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
var OnOffScheduleSerializer_exports = {};
__export(OnOffScheduleSerializer_exports, {
  OnOffScheduleSerializer: () => OnOffScheduleSerializer
});
module.exports = __toCommonJS(OnOffScheduleSerializer_exports);
var import_OnOffStateAction = require("../actions/OnOffStateAction");
var import_OnOffSchedule = require("../schedules/OnOffSchedule");
var import_ActionReferenceSerializer = require("./ActionReferenceSerializer");
class OnOffScheduleSerializer {
  constructor(triggerScheduler, actionSerializer, triggerSerializer, adapter) {
    this.triggerScheduler = triggerScheduler;
    this.actionSerializer = actionSerializer;
    this.triggerSerializer = triggerSerializer;
    this.adapter = adapter;
  }
  deserialize(stringToDeserialize) {
    const json = JSON.parse(stringToDeserialize);
    if (json.type !== this.getType()) {
      throw new Error(`Can not deserialize object of type ${json.type}`);
    }
    const onAction = this.actionSerializer.deserialize(JSON.stringify(json.onAction));
    const offAction = this.actionSerializer.deserialize(JSON.stringify(json.offAction));
    if (onAction instanceof import_OnOffStateAction.OnOffStateAction && offAction instanceof import_OnOffStateAction.OnOffStateAction) {
      const schedule = new import_OnOffSchedule.OnOffSchedule(onAction, offAction, this.triggerScheduler);
      schedule.setName(json.name);
      this.useActionReferenceSerializer(schedule);
      json.triggers.forEach(async (t) => {
        schedule.addTrigger(this.triggerSerializer.deserialize(JSON.stringify(t)));
      });
      return schedule;
    } else {
      throw new Error("Actions are not OnOffStateActions");
    }
  }
  serialize(schedule) {
    const json = {
      type: this.getType(),
      name: schedule.getName(),
      onAction: JSON.parse(this.actionSerializer.serialize(schedule.getOnAction())),
      offAction: JSON.parse(this.actionSerializer.serialize(schedule.getOffAction()))
    };
    this.useActionReferenceSerializer(schedule);
    json.triggers = schedule.getTriggers().map((t) => JSON.parse(this.triggerSerializer.serialize(t)));
    return JSON.stringify(json);
  }
  getType() {
    return "OnOffSchedule";
  }
  getTriggerSerializer(schedule) {
    if (schedule == null) {
      throw new Error("Schedule may not be null/undefined");
    }
    this.useActionReferenceSerializer(schedule);
    return this.triggerSerializer;
  }
  useActionReferenceSerializer(schedule) {
    this.actionSerializer.useSerializer(
      new import_ActionReferenceSerializer.ActionReferenceSerializer(
        import_OnOffStateAction.OnOffStateAction.prototype.constructor.name,
        /* @__PURE__ */ new Map([
          ["On", schedule.getOnAction()],
          ["Off", schedule.getOffAction()]
        ]),
        this.adapter
      )
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OnOffScheduleSerializer
});
//# sourceMappingURL=OnOffScheduleSerializer.js.map
