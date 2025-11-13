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
var UniversalTriggerScheduler_exports = {};
__export(UniversalTriggerScheduler_exports, {
  UniversalTriggerScheduler: () => UniversalTriggerScheduler
});
module.exports = __toCommonJS(UniversalTriggerScheduler_exports);
var import_TriggerScheduler = require("./TriggerScheduler");
class UniversalTriggerScheduler extends import_TriggerScheduler.TriggerScheduler {
  /**
   * @param schedulers TriggerScheduler
   * @param logger Log service
   */
  constructor(schedulers, logger) {
    super();
    this.logger = logger;
    this.schedulers = schedulers;
  }
  schedulers;
  /**
   * @param trigger Trigger
   */
  register(trigger) {
    const scheduler = this.schedulers.find((s) => s.forType() === trigger.constructor.name);
    if (scheduler) {
      return scheduler.register(trigger);
    }
    throw new Error(`Register - No scheduler for trigger of type ${trigger.constructor.name} found`);
  }
  /**
   * @param trigger Trigger
   */
  unregister(trigger) {
    const scheduler = this.schedulers.find((s) => s.forType() === trigger.constructor.name);
    if (scheduler) {
      return scheduler.unregister(trigger);
    }
    throw new Error(`Unregister - No scheduler for trigger of type ${trigger.constructor.name} found`);
  }
  /**
   * loadregister
   */
  loadregister() {
    for (const r of this.schedulers) {
      this.logger.logDebug(`Start UniversalTriggerScheduler ${r.forType()}`);
      r.loadregister();
    }
  }
  /**
   * destroy
   */
  destroy() {
    this.schedulers.forEach((s) => s.destroy());
  }
  /**
   * forType
   *
   * @returns string
   */
  forType() {
    return "Universal";
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UniversalTriggerScheduler
});
//# sourceMappingURL=UniversalTriggerScheduler.js.map
