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
var OneTimeTriggerScheduler_exports = {};
__export(OneTimeTriggerScheduler_exports, {
  OneTimeTriggerScheduler: () => OneTimeTriggerScheduler
});
module.exports = __toCommonJS(OneTimeTriggerScheduler_exports);
var import_OneTimeTrigger = require("../triggers/OneTimeTrigger");
var import_TriggerScheduler = require("./TriggerScheduler");
class OneTimeTriggerScheduler extends import_TriggerScheduler.TriggerScheduler {
  constructor(scheduleJob, cancelJob, logger, adapter) {
    super();
    this.scheduleJob = scheduleJob;
    this.cancelJob = cancelJob;
    this.logger = logger;
    this.adapter = adapter;
    this.adapter = adapter;
    this.triggerTimeout = void 0;
  }
  registered = [];
  triggerTimeout;
  forType() {
    return import_OneTimeTrigger.OneTimeTrigger.prototype.constructor.name;
  }
  register(trigger) {
    this.logger.logDebug(`Register trigger ${trigger}`);
    if (this.getAssociatedJob(trigger)) {
      throw new Error(`Trigger ${trigger} is already registered.`);
    }
    if (trigger.getDate() < /* @__PURE__ */ new Date()) {
      this.logger.logDebug(`Date is in past, deleting trigger ${trigger}`);
      this.triggerTimeout = this.adapter.setTimeout(() => {
        trigger.destroy();
        this.triggerTimeout = void 0;
      }, 2e3);
    } else {
      const newJob = this.scheduleJob(trigger.getDate(), () => {
        this.logger.logDebug(`Executing trigger ${trigger}`);
        trigger.getAction().execute(trigger.getData());
      });
      this.registered.push([trigger, newJob]);
    }
  }
  unregister(trigger) {
    this.logger.logDebug(`Unregister trigger ${trigger}`);
    const job = this.getAssociatedJob(trigger);
    if (job) {
      this.cancelJob(job);
      this.removeTrigger(trigger);
    }
  }
  loadregister() {
    for (const r of this.registered) {
      this.logger.logDebug(`OneTimeTriggerScheduler ${r[0]}`);
    }
  }
  destroy() {
    this.triggerTimeout && this.adapter.clearTimeout(this.triggerTimeout);
    this.registered.forEach((r) => this.unregister(r[0]));
  }
  getAssociatedJob(trigger) {
    const entry = this.registered.find((r) => r[0] === trigger);
    if (entry) {
      return entry[1];
    } else {
      return null;
    }
  }
  removeTrigger(trigger) {
    this.registered = this.registered.filter((r) => r[0] !== trigger);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OneTimeTriggerScheduler
});
//# sourceMappingURL=OneTimeTriggerScheduler.js.map
