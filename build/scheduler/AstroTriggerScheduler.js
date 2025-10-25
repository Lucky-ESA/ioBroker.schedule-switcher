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
var AstroTriggerScheduler_exports = {};
__export(AstroTriggerScheduler_exports, {
  AstroTriggerScheduler: () => AstroTriggerScheduler
});
module.exports = __toCommonJS(AstroTriggerScheduler_exports);
var import_AstroTrigger = require("../triggers/AstroTrigger");
var import_TimeTriggerBuilder = require("../triggers/TimeTriggerBuilder");
var import_Weekday = require("../triggers/Weekday");
var import_TriggerScheduler = require("./TriggerScheduler");
class AstroTriggerScheduler extends import_TriggerScheduler.TriggerScheduler {
  /**
   * @param timeTriggerScheduler Scheduler
   * @param getTimes GetTimesResult
   * @param coordinate Coodinate
   * @param logger Log service
   * @param first boolean
   */
  constructor(timeTriggerScheduler, getTimes, coordinate, logger, first) {
    super();
    this.timeTriggerScheduler = timeTriggerScheduler;
    this.getTimes = getTimes;
    this.coordinate = coordinate;
    this.logger = logger;
    this.first = first;
    if (!this.first) {
      this.timeTriggerScheduler.register(this.rescheduleTrigger);
    }
  }
  registered = [];
  scheduled = [];
  rescheduleTrigger = new import_TimeTriggerBuilder.TimeTriggerBuilder().setId(`AstroTriggerScheduler-Rescheduler`).setWeekdays(import_Weekday.AllWeekdays).setHour(2).setMinute(0).setObjectId(1e3).setValueCheck(false).setTodayTrigger({}).setAction({
    execute: () => {
      this.logger.logDebug(`Rescheduling astro triggers`);
      for (const s of this.scheduled) {
        this.timeTriggerScheduler.unregister(s[1]);
      }
      for (const r of this.registered) {
        this.tryScheduleTriggerToday(r);
      }
      this.loadregister();
      this.timeTriggerScheduler.loadregister();
    }
  }).build();
  /**
   * @param trigger Trigger
   */
  register(trigger) {
    this.logger.logDebug(`Register astro trigger ${trigger}`);
    if (this.isRegistered(trigger)) {
      this.logger.logWarn(`AstroTrigger ${trigger} is already registered.`);
      this.loadregister();
    } else {
      this.registered.push(trigger);
      this.tryScheduleTriggerToday(trigger);
    }
  }
  /**
   * @param trigger Trigger
   */
  unregister(trigger) {
    this.logger.logDebug(`Unregister astro trigger ${trigger}`);
    if (this.isRegistered(trigger)) {
      this.registered = this.registered.filter((t) => t.getId() !== trigger.getId());
      if (this.isScheduledToday(trigger)) {
        this.scheduled = this.scheduled.filter((s) => {
          if (s[0] === trigger.getId()) {
            this.timeTriggerScheduler.unregister(s[1]);
            return false;
          }
          return true;
        });
      } else {
        this.logger.logWarn(`AstroTrigger ${trigger} is not today.`);
        this.loadregister();
      }
    } else {
      this.logger.logWarn(`AstroTrigger ${trigger} is not registered.`);
      this.loadregister();
    }
  }
  /**
   * loadregister
   */
  loadregister() {
    for (const r of this.registered) {
      this.logger.logDebug(`Check AstroTriggerRegistered ${r}`);
    }
    for (const s of this.scheduled) {
      this.logger.logDebug(`Check AstroTriggerScheduler ${s[1]}`);
    }
  }
  /**
   * destroy
   */
  destroy() {
    this.logger.logError(`STOP`);
    this.timeTriggerScheduler.unregister(this.rescheduleTrigger);
    for (const s of this.scheduled) {
      this.logger.logError(`STOP1`);
      this.timeTriggerScheduler.unregister(s[1]);
    }
    this.timeTriggerScheduler.destroy();
    this.registered = [];
    this.scheduled = [];
  }
  /**
   * forType
   */
  forType() {
    return import_AstroTrigger.AstroTrigger.prototype.constructor.name;
  }
  tryScheduleTriggerToday(trigger) {
    const now = /* @__PURE__ */ new Date();
    const next = this.nextDate(trigger);
    this.logger.logDebug(`Time ${next.toString()} - Date ${now.toString()}`);
    if (next >= now && trigger.getWeekdays().includes(now.getDay())) {
      const entry = this.registered.find((t) => t.getId() === trigger.getId());
      const objectId = entry && typeof entry.getObjectId() === "number" ? entry.getObjectId() : 0;
      const valueCheck = entry && typeof entry.getValueCheck() === "boolean" ? entry.getValueCheck() : false;
      this.removeScheduled(trigger);
      const timeTrigger = new import_TimeTriggerBuilder.TimeTriggerBuilder().setId(`TimeTriggerForAstroTrigger:${trigger.getId()}`).setHour(next.getHours()).setMinute(next.getMinutes()).setObjectId(objectId).setValueCheck(valueCheck).setTodayTrigger({
        hour: next.getHours(),
        minute: next.getMinutes(),
        weekday: next.getDay(),
        date: next
      }).setWeekdays([next.getDay()]).setAction({
        execute: (trigger2) => {
          this.logger.logDebug(`Executing astrotrigger ${trigger2}`);
          trigger2.getAction().execute(trigger2);
        }
      }).build();
      this.logger.logDebug(`Scheduled astro with ${timeTrigger}`);
      this.timeTriggerScheduler.register(timeTrigger);
      this.scheduled.push([trigger.getId(), timeTrigger]);
    } else {
      this.logger.logDebug(`Didn't schedule ${trigger}`);
    }
  }
  isRegistered(trigger) {
    return this.registered.find((r) => r.getId() === trigger.getId()) != void 0;
  }
  isScheduledToday(trigger) {
    return this.scheduled.find((s) => s[0] === trigger.getId()) != void 0;
  }
  removeScheduled(trigger) {
    this.logger.logDebug(`Scheduled remove ${trigger}`);
    this.scheduled = this.scheduled.filter((s) => s[0] !== trigger.getId());
  }
  nextDate(trigger) {
    const next = this.getTimes(/* @__PURE__ */ new Date(), this.coordinate.getLatitude(), this.coordinate.getLongitude())[trigger.getAstroTime()];
    next.setMinutes(next.getMinutes() + trigger.getShiftInMinutes());
    return next;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AstroTriggerScheduler
});
//# sourceMappingURL=AstroTriggerScheduler.js.map
