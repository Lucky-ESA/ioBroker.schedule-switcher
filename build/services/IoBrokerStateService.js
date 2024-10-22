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
var IoBrokerStateService_exports = {};
__export(IoBrokerStateService_exports, {
  IoBrokerStateService: () => IoBrokerStateService
});
module.exports = __toCommonJS(IoBrokerStateService_exports);
class IoBrokerStateService {
  constructor(adapter, checkTime = 0, mergeTime = 0) {
    this.checkTime = checkTime;
    this.mergeTime = mergeTime;
    if (!adapter) {
      throw new Error("adapter may not be null.");
    }
    this.adapter = adapter;
    this.checkTime = Date.now();
    this.mergeTime = 0;
    this.delayTimeout = void 0;
  }
  adapter;
  delayTimeout;
  async extendObject(id, value) {
    if (!id || !value) {
      throw new Error("State or Object is empty! - extendObject");
    }
    await this.adapter.extendObject(id, value);
  }
  async setState(id, value, ack = true) {
    this.checkId(id);
    await this.adapter.setState(id, { val: value, ack });
  }
  async setForeignState(id, value, trigger) {
    this.adapter.log.debug(`TRIGGER SET: ${JSON.stringify(trigger)}`);
    const diffTime = Date.now() - this.checkTime;
    this.checkTime = Date.now();
    this.adapter.log.debug(`DIFF: ${diffTime}`);
    if (this.adapter.config.switch_delay > 0 && this.adapter.config.switch_delay > diffTime) {
      this.adapter.log.debug(`Start Sleep`);
      this.mergeTime += this.adapter.config.switch_delay;
      await this.delay(this.mergeTime);
    } else {
      this.mergeTime = 0;
    }
    if (this.adapter.config.history > 0) {
      this.setHistory(id, value, trigger);
    }
    this.checkId(id);
    this.adapter.log.debug(`Setting state ${id} with value ${value == null ? void 0 : value.toString()}`);
    this.adapter.setForeignState(id, value, false);
  }
  async setHistory(id, value, trigger) {
    if (!trigger || trigger.id == null)
      return;
    let history_value;
    history_value = await this.getState(`history`);
    try {
      if (history_value != null && typeof history_value == "string") {
        history_value = JSON.parse(history_value);
      } else {
        history_value = [];
      }
    } catch (e) {
      history_value = [];
    }
    if (Object.keys(history_value).length > this.adapter.config.history) {
      history_value.pop();
    }
    const new_data = {
      setObjectId: id,
      objectId: trigger.objectId ? trigger.objectId : "unknown",
      value: value.toString(),
      object: id,
      trigger: trigger.trigger ? trigger.trigger : "unknown",
      astroTime: trigger.astroTime ? trigger.astroTime : "unknown",
      shift: trigger.shift ? trigger.shift : 0,
      date: trigger.date ? trigger.date : 0,
      hour: trigger.hour ? trigger.hour : 0,
      minute: trigger.minute ? trigger.minute : 0,
      weekdays: trigger.weekdays ? trigger.weekdays : [],
      time: Date.now()
    };
    history_value.push(new_data);
    history_value = history_value.sort((a, b) => {
      if (a.time > b.time) {
        return -1;
      }
    });
    await this.setState(`history`, JSON.stringify(history_value), true);
  }
  async getForeignState(id) {
    return new Promise((resolve, _) => {
      this.checkId(id);
      this.adapter.getForeignState(id, (err, state) => {
        if (err || state == null) {
          this.adapter.log.error(`Requested state ${id} returned null/undefined!`);
        }
        resolve(state == null ? void 0 : state.val);
      });
    });
  }
  async getState(id) {
    return new Promise((resolve, _) => {
      this.checkId(id);
      this.adapter.getState(id, (err, state) => {
        if (err || state == null) {
          this.adapter.log.error(`Requested getState ${id} returned null/undefined!`);
        }
        resolve(state == null ? void 0 : state.val);
      });
    });
  }
  delay(ms) {
    return new Promise((resolve) => {
      this.delayTimeout = this.adapter.setTimeout(resolve, ms);
    });
  }
  destroy() {
    this.delayTimeout && this.adapter.clearTimeout(this.delayTimeout);
  }
  checkId(id) {
    if (id == null || id.length === 0) {
      throw new Error("id may not be null or empty.");
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  IoBrokerStateService
});
//# sourceMappingURL=IoBrokerStateService.js.map
