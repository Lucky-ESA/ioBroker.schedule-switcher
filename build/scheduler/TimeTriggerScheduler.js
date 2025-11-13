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
var TimeTriggerScheduler_exports = {};
__export(TimeTriggerScheduler_exports, {
  TimeTriggerScheduler: () => TimeTriggerScheduler
});
module.exports = __toCommonJS(TimeTriggerScheduler_exports);
var import_node_schedule = require("node-schedule");
var import_TimeTrigger = require("../triggers/TimeTrigger");
var import_TriggerScheduler = require("./TriggerScheduler");
class TimeTriggerScheduler extends import_TriggerScheduler.TriggerScheduler {
  /**
   *
   * @param scheduleJob Schedule
   * @param cancelJob Schedule
   * @param logger Log service
   */
  constructor(scheduleJob, cancelJob, logger) {
    super();
    this.scheduleJob = scheduleJob;
    this.cancelJob = cancelJob;
    this.logger = logger;
  }
  registered = [];
  /**
   * @param trigger TimeTrigger
   */
  register(trigger) {
    this.logger.logDebug(`Register TimeTriggerScheduler trigger ${trigger}`);
    if (this.getAssociatedJob(trigger)) {
      this.loadregister();
      throw new Error(`TimeTriggerScheduler Trigger ${trigger} is already registered.`);
    } else {
      const newJob = this.scheduleJob(this.createRecurrenceRule(trigger), () => {
        this.logger.logDebug(`Executing TimeTriggerScheduler trigger ${trigger}`);
        const trigger_data = JSON.parse(JSON.stringify(trigger.getData()));
        trigger.getAction().execute(trigger_data);
      });
      this.registered.push([trigger, newJob]);
    }
  }
  /**
   * loadregister
   */
  loadregister() {
    for (const r of this.registered) {
      this.logger.logDebug(`Check TimeTriggerScheduler ${r[0]}`);
    }
  }
  /**
   * @param trigger TimeTrigger
   */
  unregister(trigger) {
    this.logger.logDebug(`Unregister TimeTriggerScheduler trigger ${trigger}`);
    const job = this.getAssociatedJob(trigger);
    if (job) {
      this.cancelJob(job);
      this.removeTrigger(trigger);
    } else {
      this.loadregister();
      if (trigger.toString().toString().indexOf("TimeTriggerForAstroTrigger") !== -1) {
        this.logger.logDebug(`TimeTriggerScheduler trigger not found!`);
      } else {
        throw new Error(`TimeTriggerScheduler Trigger ${trigger} is not registered.`);
      }
    }
  }
  /**
   * destroy
   */
  destroy() {
    this.registered.forEach((r) => this.unregister(r[0]));
  }
  /**
   * forType
   *
   * @returns trigger action on/off
   */
  forType() {
    return import_TimeTrigger.TimeTrigger.prototype.constructor.name;
  }
  /**
   * @param trigger OneTimeTrigger
   */
  getAssociatedJob(trigger) {
    const entry = this.registered.find((r) => r[0] === trigger);
    if (entry) {
      return entry[1];
    }
    this.loadregister();
    return null;
  }
  /**
   * @param trigger OneTimeTrigger
   */
  removeTrigger(trigger) {
    this.registered = this.registered.filter((r) => r[0] !== trigger);
  }
  /**
   * Create scheduler
   *
   * @param trigger OneTimeTrigger
   */
  createRecurrenceRule(trigger) {
    const rule = new import_node_schedule.RecurrenceRule();
    rule.dayOfWeek = trigger.getWeekdays();
    rule.hour = trigger.getHour();
    rule.minute = trigger.getMinute();
    return rule;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TimeTriggerScheduler
});
//# sourceMappingURL=TimeTriggerScheduler.js.map
