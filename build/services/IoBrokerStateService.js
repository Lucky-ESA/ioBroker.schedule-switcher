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
  adapter;
  delayTimeout;
  checkTime = 0;
  mergeTime = 0;
  html;
  /**
   * @param adapter ioBroker
   * @param vishtmltable htmltable
   */
  constructor(adapter, vishtmltable) {
    if (!adapter) {
      throw new Error("adapter may not be null.");
    }
    this.adapter = adapter;
    this.checkTime = Date.now();
    this.mergeTime = 0;
    this.delayTimeout = void 0;
    this.html = vishtmltable;
  }
  /**
   * @param id ID
   * @param value Values
   */
  async extendObject(id, value) {
    if (!id || !value) {
      throw new Error("State or Object is empty! - extendObject");
    }
    this.checkId(id);
    await this.adapter.extendObject(id, value);
  }
  /**
   * @param id ID
   * @param value Values
   * @param ack Ack flag
   */
  async setState(id, value, ack = true) {
    this.checkId(id);
    await this.adapter.setState(id, { val: value, ack });
  }
  /**
   * @param id ID
   * @param value Values
   * @param trigger Trigger
   */
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
    const old_value = await this.adapter.getForeignStateAsync(id);
    const old_val = old_value == null ? null : old_value.val;
    let change_val = false;
    this.adapter.log.debug(trigger.valueCheck.toString());
    if (trigger.valueCheck) {
      if (JSON.stringify(value) === JSON.stringify(old_val)) {
        this.adapter.log.debug(`Set not change!`);
        change_val = true;
      }
    }
    if (this.adapter.config.history > 0) {
      await this.setHistory(id, value, trigger, old_val, change_val);
    }
    this.checkId(id);
    if (!change_val) {
      this.adapter.log.debug(`Set state ${id} with value ${value == null ? void 0 : value.toString()} - ${old_val == null ? void 0 : old_val.toString()}`);
      this.adapter.setForeignState(id, value, false);
      void this.html.updateStateHTML();
    } else {
      this.adapter.log.debug(`Set not state ${id} with value ${value == null ? void 0 : value.toString()} - ${old_val == null ? void 0 : old_val.toString()}`);
    }
  }
  /**
   * @param id ID
   * @param value Values
   * @param trigger Trigger
   * @param old_value Actual value
   * @param setVal Set new value
   */
  async setHistory(id, value, trigger, old_value, setVal) {
    if (!trigger || trigger.id != null) {
      let history_newvalue = [];
      const history_value = await this.getState(`history`);
      try {
        if (history_value != null && typeof history_value == "string") {
          history_newvalue = JSON.parse(history_value);
        } else {
          history_newvalue = [];
        }
      } catch {
        history_newvalue = [];
      }
      if (Object.keys(history_newvalue).length > this.adapter.config.history) {
        history_newvalue.pop();
      }
      const nowTime = /* @__PURE__ */ new Date();
      const new_data = {
        setObjectId: id,
        objectId: trigger.objectId != null ? trigger.objectId : "unknown",
        actualValue: value,
        oldValue: old_value,
        checkValue: setVal,
        trigger: trigger.trigger != null ? trigger.trigger : "unknown",
        astroTime: trigger.astroTime != null ? trigger.astroTime : "unknown",
        shiftInMinutes: trigger.shiftInMinutes != null ? trigger.shiftInMinutes : 0,
        date: trigger.date != null ? trigger.date : 0,
        hour: trigger.hour != null ? trigger.hour : 0,
        minute: trigger.minute != null ? trigger.minute : 0,
        weekdays: trigger.weekdays != null ? trigger.weekdays : [],
        timestamp: Date.now(),
        dateTime: nowTime.toISOString(),
        dateTimeWithTimezone: nowTime.setHours(nowTime.getHours() - nowTime.getTimezoneOffset() / 60) ? nowTime : /* @__PURE__ */ new Date()
      };
      history_newvalue.push(new_data);
      history_newvalue.sort((a, b) => {
        if (a.timestamp > b.timestamp) {
          return -1;
        }
      });
      await this.setState(`history`, JSON.stringify(history_newvalue), true);
    }
  }
  /**
   * @param id ID
   */
  async getForeignState(id) {
    return new Promise((resolve, _) => {
      this.checkId(id);
      void this.adapter.getForeignState(id, (err, state) => {
        if (err || state == null) {
          this.adapter.log.error(`Requested state ${id} returned null/undefined!`);
        }
        resolve(state == null ? void 0 : state.val);
      });
    });
  }
  /**
   * @param id ID
   */
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
  /**
   * @param ms milliseconds
   */
  delay(ms) {
    return new Promise((resolve) => {
      this.delayTimeout = this.adapter.setTimeout(resolve, ms);
    });
  }
  /**
   * destroy all
   */
  destroy() {
    this.delayTimeout && this.adapter.clearTimeout(this.delayTimeout);
    this.delayTimeout = void 0;
    return Promise.resolve(true);
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
