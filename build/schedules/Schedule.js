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
var Schedule_exports = {};
__export(Schedule_exports, {
  Schedule: () => Schedule
});
module.exports = __toCommonJS(Schedule_exports);
class Schedule {
  enabled = false;
  name = "New Schedule";
  triggers = [];
  triggerScheduler;
  logger;
  constructor(triggerScheduler, logger) {
    if (triggerScheduler == null) {
      throw new Error(`triggerScheduler may not be null or undefined`);
    }
    this.triggerScheduler = triggerScheduler;
    this.logger = logger;
  }
  /**
   * @param enabled enabled
   */
  setEnabled(enabled) {
    if (enabled !== this.enabled) {
      if (enabled) {
        this.getTriggers().forEach((t) => this.triggerScheduler.register(t));
      } else {
        this.triggerScheduler.destroy();
      }
      this.enabled = enabled;
    }
  }
  /**
   * @param name change name
   */
  setName(name) {
    if (name == null) {
      this.logger.logWarn(`name may not be null or undefined`);
      name = "Unknown";
    }
    this.name = name;
  }
  /**
   * isEnabled
   *
   * @returns status
   */
  isEnabled() {
    return this.enabled;
  }
  /**
   * getName
   *
   * @returns namr
   */
  getName() {
    return this.name;
  }
  /**
   * getTriggers
   *
   * @returns trigger
   */
  getTriggers() {
    return this.triggers;
  }
  /**
   * @param trigger Trigger
   */
  addTrigger(trigger) {
    if (this.findTriggerById(trigger.getId())) {
      this.logger.logWarn(`Cannot add trigger, trigger id ${trigger.getId()} exists already`);
    } else {
      this.triggers.push(trigger);
      if (this.isEnabled()) {
        this.triggerScheduler.register(trigger);
      }
    }
  }
  /**
   * loadregister
   */
  loadregister() {
    for (const r of this.triggers) {
      this.logger.logDebug(`Schedule ${r}`);
    }
    this.triggerScheduler.loadregister();
  }
  /**
   * @param trigger Trigger
   */
  updateTrigger(trigger) {
    const index = this.getTriggers().findIndex((t) => t.getId() === trigger.getId());
    if (index == -1) {
      this.logger.logWarn(`Cannot update trigger, trigger id ${trigger.getId()} not found`);
    } else {
      if (this.isEnabled()) {
        this.triggerScheduler.unregister(this.getTriggers()[index]);
        this.triggerScheduler.register(trigger);
      }
      this.triggers[index] = trigger;
    }
  }
  /**
   * @param triggerId ID
   */
  removeTrigger(triggerId) {
    const trigger = this.triggers.find((t) => t.getId() === triggerId);
    if (trigger) {
      this.removeTriggerAndUnregister(trigger);
    } else {
      this.logger.logInfo(`Cannot delete trigger, trigger id ${triggerId} not found`);
    }
  }
  /**
   * destroy
   */
  destroy() {
    if (this.isEnabled()) {
      this.triggerScheduler.destroy();
    }
    this.triggers = [];
  }
  /**
   * @param trigger Trigger
   */
  removeTriggerAndUnregister(trigger) {
    if (this.isEnabled()) {
      this.triggerScheduler.unregister(trigger);
    }
    this.triggers = this.triggers.filter((t) => t.getId() !== trigger.getId());
  }
  /**
   * @param id id Trigger
   * @returns trigger
   */
  findTriggerById(id) {
    return this.getTriggers().find((t) => t.getId() === id);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Schedule
});
//# sourceMappingURL=Schedule.js.map
