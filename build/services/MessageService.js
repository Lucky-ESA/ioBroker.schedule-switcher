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
var MessageService_exports = {};
__export(MessageService_exports, {
  MessageService: () => MessageService
});
module.exports = __toCommonJS(MessageService_exports);
var import_suncalc = require("suncalc");
var import_OnOffSchedule = require("../schedules/OnOffSchedule");
var import_AstroTime = require("../triggers/AstroTime");
var import_AstroTriggerBuilder = require("../triggers/AstroTriggerBuilder");
var import_TimeTriggerBuilder = require("../triggers/TimeTriggerBuilder");
var import_Weekday = require("../triggers/Weekday");
class MessageService {
  constructor(stateService, scheduleIdToSchedule, createOnOffScheduleSerializer, adapter, coordinate) {
    this.stateService = stateService;
    this.scheduleIdToSchedule = scheduleIdToSchedule;
    this.createOnOffScheduleSerializer = createOnOffScheduleSerializer;
    this.adapter = adapter;
    this.coordinate = coordinate;
    this.adapter = adapter;
    this.triggerTimeout = void 0;
  }
  currentMessage = null;
  triggerTimeout;
  async handleMessage(message) {
    if (this.currentMessage) {
      this.triggerTimeout = this.adapter.setTimeout(() => {
        this.handleMessage(message);
        this.triggerTimeout = void 0;
      }, 50);
      return;
    }
    this.currentMessage = message;
    const data = message.message;
    if (message.command === "change-view-dataId") {
      await this.updateViews(data);
      this.adapter.log.debug("Finished message " + message.command);
      this.currentMessage = null;
      return;
    }
    this.adapter.log.debug(`Received ${message.command}`);
    this.adapter.log.debug(JSON.stringify(message.message));
    const schedule = this.scheduleIdToSchedule.get(data.dataId);
    if (!schedule) {
      this.adapter.log.error(`No schedule found for state ${data.dataId}`);
      this.currentMessage = null;
      return;
    }
    switch (message.command) {
      case "add-trigger":
        await this.addTrigger(schedule, data);
        break;
      case "add-one-time-trigger":
        await this.addOneTimeTrigger(schedule, data);
        break;
      case "update-one-time-trigger":
        await this.updateOneTimeTrigger(schedule, JSON.stringify(data.trigger), data.dataId);
        break;
      case "update-trigger":
        if (data.trigger && data.trigger.type === "AstroTrigger") {
          data.trigger.todayTrigger = await this.nextDate(data.trigger);
        }
        await this.updateTrigger(schedule, JSON.stringify(data.trigger), data.dataId);
        break;
      case "delete-trigger":
        schedule.removeTrigger(data.triggerId);
        break;
      case "change-name":
        schedule.setName(data.name);
        this.changeName(data);
        break;
      case "enable-schedule":
        schedule.setEnabled(true);
        await this.stateService.setState(this.getEnabledIdFromScheduleId(data.dataId), true);
        break;
      case "disable-schedule":
        schedule.setEnabled(false);
        await this.stateService.setState(this.getEnabledIdFromScheduleId(data.dataId), false);
        break;
      case "change-switched-values":
        this.changeOnOffSchedulesSwitchedValues(schedule, data);
        break;
      case "change-switched-ids":
        this.changeOnOffSchedulesSwitchedIds(schedule, data.stateIds);
        break;
      default:
        this.adapter.log.error("Unknown command received");
        this.currentMessage = null;
        return;
    }
    if (schedule instanceof import_OnOffSchedule.OnOffSchedule) {
      this.stateService.setState(
        data.dataId,
        (await this.createOnOffScheduleSerializer(data.dataId)).serialize(schedule)
      );
    } else {
      this.adapter.log.error("Cannot update schedule state after message, no serializer found for schedule");
      return;
    }
    this.adapter.log.debug("Finished message " + message.command);
    this.currentMessage = null;
  }
  async changeName(data) {
    const state = data == null ? void 0 : data.dataId.split(".");
    await this.stateService.extendObject(`onoff.${state[3]}`, { common: { name: data == null ? void 0 : data.name } });
    await this.stateService.extendObject(`onoff.${state[3]}.data`, { common: { name: data == null ? void 0 : data.name } });
  }
  getEnabledIdFromScheduleId(scheduleId) {
    return scheduleId.replace("data", "enabled");
  }
  async nextDate(data) {
    const next = (0, import_suncalc.getTimes)(/* @__PURE__ */ new Date(), this.coordinate.getLatitude(), this.coordinate.getLongitude());
    let astro;
    if (data.astroTime === "sunset") {
      astro = next.sunset;
    } else if (data.astroTime === "sunrise") {
      astro = next.sunrise;
    } else {
      astro = next.solarNoon;
    }
    new Date(astro.getTime()).setMinutes(new Date(astro.getTime()).getMinutes() + data.shiftInMinutes);
    return { hour: astro.getHours(), minute: astro.getMinutes(), weekday: astro.getDay(), date: astro };
  }
  async addTrigger(schedule, data) {
    const state = data == null ? void 0 : data.dataId.split(".");
    let triggerBuilder;
    if (data.triggerType === "TimeTrigger") {
      this.adapter.log.debug("Wants TimeTrigger");
      triggerBuilder = new import_TimeTriggerBuilder.TimeTriggerBuilder().setHour(0).setMinute(0).setObjectId(parseInt(state[3]));
    } else if (data.triggerType === "AstroTrigger") {
      this.adapter.log.debug("Wants AstroTrigger");
      triggerBuilder = new import_AstroTriggerBuilder.AstroTriggerBuilder().setAstroTime(import_AstroTime.AstroTime.Sunrise).setShift(0).setObjectId(parseInt(state[3])).setTodayTrigger(await this.nextDate({ astroTime: "sunrise", shiftInMinutes: 0 }));
    } else {
      this.adapter.log.error(`Cannot add trigger of type ${data.triggerType}`);
      return;
    }
    triggerBuilder.setWeekdays(import_Weekday.AllWeekdays).setId(this.getNextTriggerId(schedule.getTriggers()));
    if (data.actionType === "OnOffStateAction" && schedule instanceof import_OnOffSchedule.OnOffSchedule) {
      this.adapter.log.debug("Wants OnOffStateAction");
      triggerBuilder.setAction(schedule.getOnAction());
    } else {
      this.adapter.log.error(`Cannot add trigger with action of type ${data.actionType}`);
      return;
    }
    schedule.addTrigger(triggerBuilder.build());
  }
  async updateOneTimeTrigger(schedule, triggerString, dataId) {
    let updated;
    if (schedule instanceof import_OnOffSchedule.OnOffSchedule) {
      updated = (await this.createOnOffScheduleSerializer(dataId)).getTriggerSerializer(schedule).deserialize(triggerString);
    } else {
      this.adapter.log.error(`Can not deserialize trigger for schedule of type ${typeof schedule}`);
      return;
    }
    schedule.updateTrigger(updated);
  }
  async addOneTimeTrigger(schedule, data) {
    const t = JSON.parse(data.trigger);
    const id = data.dataId.split(".");
    t.id = this.getNextTriggerId(schedule.getTriggers());
    t.objectId = parseInt(id[3]);
    const trigger = (await this.createOnOffScheduleSerializer(data.dataId)).getTriggerSerializer(schedule).deserialize(JSON.stringify(t));
    schedule.addTrigger(trigger);
  }
  async updateTrigger(schedule, triggerString, dataId) {
    let updated;
    if (schedule instanceof import_OnOffSchedule.OnOffSchedule) {
      updated = (await this.createOnOffScheduleSerializer(dataId)).getTriggerSerializer(schedule).deserialize(triggerString);
    } else {
      this.adapter.log.error(`Can not deserialize trigger for schedule of type ${typeof schedule}`);
      return;
    }
    schedule.updateTrigger(updated);
  }
  async updateViews(data) {
    if (data) {
      if (data.newId && data.newId.endsWith(".data")) {
        const path = `${data.newId.replace(".data", ".views")}`;
        const pathSplit = path.split(".");
        const id = parseInt(pathSplit[3]);
        if (!isNaN(id)) {
          const valView = await this.stateService.getState(path);
          if (valView != null) {
            const newView = typeof valView === "string" ? JSON.parse(valView) : valView;
            if (newView && newView[data.namespace] && newView[data.namespace][data.prefix]) {
              newView[data.namespace][data.prefix][data.widgetId] = data;
            } else {
              newView[data.namespace] = {};
              newView[data.namespace][data.prefix] = {};
              newView[data.namespace][data.prefix][data.widgetId] = data;
            }
            this.stateService.setState(path, JSON.stringify(newView));
          }
        }
      }
      if (data.oldId && data.oldId.endsWith(".data")) {
        const oldPath = `${data.oldId.replace(".data", ".views")}`;
        const oldPathSplit = oldPath.split(".");
        const id = parseInt(oldPathSplit[3]);
        if (!isNaN(id)) {
          const valOldView = await this.stateService.getState(oldPath);
          if (valOldView != null) {
            const oldView = typeof valOldView === "string" ? JSON.parse(valOldView) : valOldView;
            if (oldView && oldView[data.namespace] && oldView[data.namespace][data.prefix] && oldView[data.namespace][data.prefix][data.widgetId]) {
              if (Object.keys(oldView[data.namespace]).length === 1) {
                delete oldView[data.namespace];
              } else if (Object.keys(oldView[data.namespace][data.prefix]).length === 1) {
                oldView[data.namespace][data.prefix];
              } else {
                delete oldView[data.namespace][data.prefix][data.widgetId];
              }
              this.stateService.setState(oldPath, JSON.stringify(oldView));
            }
          }
        }
      }
    }
  }
  changeOnOffSchedulesSwitchedValues(schedule, data) {
    if (!(schedule instanceof import_OnOffSchedule.OnOffSchedule)) {
      this.adapter.log.error(`Cannot change switched values when schedule type is not OnOffSchedule`);
      return;
    }
    if (schedule.getOnAction().getValueType() === data.valueType && schedule.getOnAction().getBooleanValue()) {
      this.adapter.log.debug("Catch no boolean change!!");
      return;
    }
    schedule.setOnAction(this.changeSwitchedValueOfOnOffScheduleAction(schedule.getOnAction(), data));
    schedule.setOffAction(this.changeSwitchedValueOfOnOffScheduleAction(schedule.getOffAction(), data));
  }
  changeOnOffSchedulesSwitchedIds(schedule, stateIds) {
    if (!(schedule instanceof import_OnOffSchedule.OnOffSchedule)) {
      this.adapter.log.error(`Cannot change switched ids when schedule type is not OnOffSchedule`);
      return;
    }
    schedule.getOnAction().setIdsOfStatesToSet(stateIds);
    schedule.getOffAction().setIdsOfStatesToSet(stateIds);
  }
  changeSwitchedValueOfOnOffScheduleAction(action, data) {
    switch (data.valueType) {
      case "boolean":
        return action.toBooleanValueType();
        break;
      case "number":
        return action.toNumberValueType(data.onValue, data.offValue);
        break;
      case "string":
        return action.toStringValueType(data.onValue, data.offValue);
        break;
      default:
        throw new Error(`Value Type ${data.valueType} not supported`);
    }
  }
  destroy() {
    this.triggerTimeout && this.adapter.clearTimeout(this.triggerTimeout);
  }
  getNextTriggerId(current) {
    const numbers = current.map((t) => t.getId()).map((id) => Number.parseInt(id, 10)).filter((id) => !Number.isNaN(id)).sort((a, b) => a - b);
    let newId = 0;
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] > newId) {
        break;
      } else {
        newId++;
      }
    }
    return newId.toString();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MessageService
});
//# sourceMappingURL=MessageService.js.map
