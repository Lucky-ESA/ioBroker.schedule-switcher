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
var IoBrokerValidationState_exports = {};
__export(IoBrokerValidationState_exports, {
  IoBrokerValidationState: () => IoBrokerValidationState
});
module.exports = __toCommonJS(IoBrokerValidationState_exports);
var import_suncalc = require("suncalc");
var import_AstroTime = require("../types/AstroTime");
class IoBrokerValidationState {
  /**
   * @param adapter iobroker
   * @param coordinate Coodinate
   */
  constructor(adapter, coordinate) {
    this.adapter = adapter;
    this.coordinate = coordinate;
    this.adapter = adapter;
  }
  /**
   * validation
   *
   * @param id ID
   * @param val State val
   * @param check boolean
   */
  async validation(id, val, check) {
    const removeDuplicate = (arr) => {
      return arr.filter((item, index) => arr.indexOf(item) === index);
    };
    if (val.type && val.type == "OnOffSchedule" || check) {
      if (!check) {
        this.adapter.log.debug(`Validation Data ${val.name}`);
        if (val.onAction) {
          if (val.onAction.type == "OnOffStateAction") {
            if (val.onAction.type.valueType == "boolean") {
              val.onAction.type.onValue = true;
              val.onAction.type.offValue = false;
              if (typeof val.onAction.type.booleanValue !== "boolean") {
                this.adapter.log.warn(`Value of ${id} is changed to false`);
                val.onAction.type.booleanValue = false;
              }
            } else if (val.onAction.type.valueType == "number") {
              if (typeof val.onAction.type.onValue !== "number") {
                this.adapter.log.warn(`Value of ${id} is changed to 0`);
                val.onAction.type.booleanValue = 0;
              }
              if (typeof val.onAction.type.offValue !== "number") {
                this.adapter.log.warn(`Value of ${id} is changed to 10`);
                val.onAction.type.booleanValue = 10;
              }
              if (typeof val.onAction.type.booleanValue !== "number") {
                this.adapter.log.warn(`Value of ${id} is changed to 0`);
                val.onAction.type.booleanValue = 0;
              }
            } else if (val.onAction.type.valueType == "string") {
              if (typeof val.onAction.type.onValue !== "string") {
                this.adapter.log.warn(`Value of ${id} is changed to empty`);
                val.onAction.type.booleanValue = "";
              }
              if (typeof val.onAction.type.offValue !== "string") {
                this.adapter.log.warn(`Value of ${id} is changed to empty`);
                val.onAction.type.booleanValue = "";
              }
              if (typeof val.onAction.type.booleanValue !== "string") {
                this.adapter.log.warn(`Value of ${id} is changed to empty`);
                val.onAction.type.booleanValue = "";
              }
              if (typeof val.onAction.type.idsOfStatesToSet === "object") {
                const ids = [];
                for (const state of val.onAction.type.idsOfStatesToSet) {
                  const value = await this.adapter.getForeignObjectAsync(state);
                  if (value) {
                    ids.push(state);
                  } else {
                    this.adapter.log.error(`Requested state ${id} returned null/undefined!`);
                  }
                }
                val.onAction.type.idsOfStatesToSet = ids;
              } else {
                val.onAction.type.idsOfStatesToSet = [];
                this.adapter.log.warn(`The states are not objects, changed ${id} to empty`);
              }
            }
          } else {
            this.adapter.log.error(`Cannot found onAction type 'OnOffStateAction' in ${id}`);
            return val = {};
          }
        } else {
          this.adapter.log.error(`Cannot found onAction in ${id}`);
          return val = {};
        }
        if (val.offAction) {
          if (val.offAction.type == "OnOffStateAction") {
            if (val.offAction.type.valueType == "boolean") {
              val.offAction.type.onValue = true;
              val.offAction.type.offValue = false;
              if (typeof val.offAction.type.booleanValue !== "boolean") {
                this.adapter.log.warn(`Value of ${id} is changed to false`);
                val.offAction.type.booleanValue = false;
              }
            } else if (val.offAction.type.valueType == "number") {
              if (typeof val.offAction.type.onValue !== "number") {
                this.adapter.log.warn(`Value of ${id} is changed to 0`);
                val.offAction.type.booleanValue = 0;
              }
              if (typeof val.offAction.type.offValue !== "number") {
                this.adapter.log.warn(`Value of ${id} is changed to 10`);
                val.offAction.type.booleanValue = 10;
              }
              if (typeof val.offAction.type.booleanValue !== "number") {
                this.adapter.log.warn(`Value of ${id} is changed to 0`);
                val.offAction.type.booleanValue = 0;
              }
            } else if (val.offAction.type.valueType == "string") {
              if (typeof val.offAction.type.onValue !== "string") {
                this.adapter.log.warn(`Value of ${id} is changed to empty`);
                val.offAction.type.booleanValue = "";
              }
              if (typeof val.offAction.type.offValue !== "string") {
                this.adapter.log.warn(`Value of ${id} is changed to empty`);
                val.offAction.type.booleanValue = "";
              }
              if (typeof val.offAction.type.booleanValue !== "string") {
                this.adapter.log.warn(`Value of ${id} is changed to empty`);
                val.offAction.type.booleanValue = "";
              }
              if (typeof val.offAction.type.idsOfStatesToSet === "object") {
                const ids = [];
                for (const state of val.offAction.type.idsOfStatesToSet) {
                  const value = await this.adapter.getForeignObjectAsync(state);
                  if (value) {
                    ids.push(state);
                  } else {
                    this.adapter.log.error(`Requested state ${id} returned null/undefined!`);
                  }
                }
                val.offAction.type.idsOfStatesToSet = ids;
              } else {
                val.offAction.type.idsOfStatesToSet = [];
                this.adapter.log.warn(`The states are not objects, changed ${id} to empty`);
              }
            }
          } else {
            this.adapter.log.error(`Cannot found offAction type 'OnOffStateAction' in ${id}`);
            return val = {};
          }
        } else {
          this.adapter.log.error(`Cannot found offAction in ${id}`);
          return val = {};
        }
      }
      if (val.triggers && typeof val.triggers === "object" && val.triggers.length > 0) {
        this.adapter.log.debug(`Validation all Triggers ${val.name}`);
        const newTrigger = [];
        for (const trigger of val.triggers) {
          if (trigger.type === "TimeTrigger") {
            if (trigger.hour == void 0 || trigger.hour < 0 || trigger.hour > 23) {
              this.adapter.log.warn(`Hour must be in range 0-23 - in ${id}`);
              trigger.hour = 0;
            }
            if (trigger.minute == void 0 || trigger.minute < 0 || trigger.minute > 59) {
              this.adapter.log.warn(`Minute must be in range 0-59 - in ${id}`);
              trigger.minute = 0;
            }
            if (trigger.weekdays) {
              trigger.weekdays = removeDuplicate(trigger.weekdays);
            }
            const t = await this.nextDateSwitch(/* @__PURE__ */ new Date(), trigger);
            const nextDate = t != void 0 ? new Date(t).getDay() : 0;
            trigger.todayTrigger = {
              hour: trigger.hour,
              minute: trigger.minute,
              weekday: nextDate,
              date: t
            };
            if (typeof trigger.weekdays !== "object" || trigger.weekdays.length === 0 || trigger.weekdays.length > 7) {
              this.adapter.log.error(`Empty weekday is not allowed in ${id}`);
              trigger.weekdays = [0];
            }
            if (trigger.todayTrigger == void 0) {
              trigger.todayTrigger = {};
            }
          } else if (trigger.type === "AstroTrigger") {
            if (trigger.astroTime == null || trigger.astroTime !== "sunrise" && trigger.astroTime !== "sunset" && trigger.astroTime !== "solarNoon" && trigger.astroTime !== "sunriseEnd" && trigger.astroTime !== "goldenHourEnd" && trigger.astroTime !== "goldenHour" && trigger.astroTime !== "sunsetStart" && trigger.astroTime !== "dusk" && trigger.astroTime !== "nauticalDusk" && trigger.astroTime !== "night" && trigger.astroTime !== "nadir" && trigger.astroTime !== "nightEnd" && trigger.astroTime !== "nauticalDawn" && trigger.astroTime !== "dawn") {
              this.adapter.log.warn(`Astro time may not be null - in ${id}`);
              trigger.astroTime = "sunrise";
            }
            if (trigger.shiftInMinutes == null || trigger.shiftInMinutes > 120 || trigger.shiftInMinutes < -120) {
              this.adapter.log.warn(`Shift in minutes must be in range -120 to 120 - in ${id}`);
              trigger.shiftInMinutes = 0;
            }
          } else if (trigger.type === "OneTimeTrigger") {
            if (isNaN(new Date(trigger.date).getTime())) {
              this.adapter.log.warn(`Wrong OneTimeDate ${trigger.date} in ${id}`);
              trigger.date = (/* @__PURE__ */ new Date()).toISOString();
            }
            if (trigger.timedate == null || typeof trigger.timedate !== "boolean") {
              this.adapter.log.warn(`Wrong timedate ${trigger.timedate} in ${id}`);
              trigger.timedate = true;
            }
          } else {
            this.adapter.log.error(`Cannot found trigger type ${trigger.type} in ${id}`);
            return val = {};
          }
          const objId = id.split(".");
          if (trigger.objectId.toString() != objId[3]) {
            this.adapter.log.warn(`Wrong ObjectId ${trigger.objectId} in ${id}`);
            trigger.objectId = parseInt(objId[3]);
          }
          if (trigger.valueCheck == null || typeof trigger.valueCheck !== "boolean") {
            trigger.valueCheck = false;
            this.adapter.log.warn(`Wrong valueCheck ${JSON.stringify(trigger)} in ${id}`);
          }
          if (!trigger.action) {
            trigger.action = {};
            this.adapter.log.warn(`Wrong action ${JSON.stringify(trigger)} in ${id}`);
          }
          if (trigger.action.type !== "OnOffStateAction") {
            if (trigger.action.type === "ConditionAction") {
              if (!trigger.action.condition) {
                this.adapter.log.warn(
                  `Missing action condition ${JSON.stringify(trigger.action)} in ${id}`
                );
                return val = {};
              }
              if (trigger.action.condition.type !== "StringStateAndConstantCondition") {
                if (trigger.action.condition.constant == "") {
                  trigger.action.condition.constant = "true";
                  this.adapter.log.warn(
                    `Wrong condition constant ${JSON.stringify(trigger.action)} in ${id}! Set constant to TRUE!`
                  );
                }
                if (!trigger.action.condition.stateId1 || !trigger.action.condition.stateId2) {
                  this.adapter.log.warn(
                    `Missing action condition states1 or states2 ${JSON.stringify(trigger.action)} in ${id}`
                  );
                  return val = {};
                }
                const stateId1 = await this.adapter.getForeignObjectAsync(
                  trigger.action.condition.stateId1
                );
                if (!stateId1) {
                  this.adapter.log.warn(
                    `Wrong action condition states1 ${JSON.stringify(trigger.action)} in ${id}`
                  );
                  return val = {};
                }
                const stateId2 = await this.adapter.getForeignObjectAsync(
                  trigger.action.condition.stateId2
                );
                if (!stateId2) {
                  this.adapter.log.warn(
                    `Wrong action condition states2 ${JSON.stringify(trigger.action)} in ${id}`
                  );
                  return val = {};
                }
              } else if (trigger.action.condition.type !== "StringStateAndStateCondition") {
                if (!trigger.action.condition.stateId) {
                  this.adapter.log.warn(
                    `Missing action condition states ${JSON.stringify(trigger.action)} in ${id}`
                  );
                  return val = {};
                }
                const stateId = await this.adapter.getForeignObjectAsync(
                  trigger.action.condition.stateId
                );
                if (!stateId) {
                  this.adapter.log.warn(
                    `Wrong action condition states ${JSON.stringify(trigger.action)} in ${id}`
                  );
                  return val = {};
                }
              } else {
                this.adapter.log.warn(
                  `Wrong action condition string ${JSON.stringify(trigger.action)} in ${id}`
                );
                return val = {};
              }
              if (trigger.action.condition.sign !== "==" && trigger.action.condition.sign !== "!=") {
                trigger.action.condition.sign = "==";
                this.adapter.log.warn(
                  `Wrong condition sign ${JSON.stringify(trigger.action)} in ${id}`
                );
              }
              if (!trigger.action.action) {
                trigger.action.action = {};
                this.adapter.log.warn(
                  `Wrong action condition ${JSON.stringify(trigger.action)} in ${id}`
                );
              }
              if (trigger.action.action.type !== "OnOffStateAction") {
                trigger.action.action.type = "OnOffStateAction";
                this.adapter.log.warn(
                  `Wrong action type ${JSON.stringify(trigger.action.action)} in ${id}`
                );
              }
              if (trigger.action.action.name !== "Off" && trigger.action.action.name !== "On") {
                trigger.action.action.name = "Off";
                this.adapter.log.warn(
                  `Wrong action name ${JSON.stringify(trigger.action)} in ${id} - set Off`
                );
              }
            } else {
              trigger.action.type = "OnOffStateAction";
              this.adapter.log.warn(`Wrong action type ${JSON.stringify(trigger.action)} in ${id}`);
              if (trigger.action.name !== "Off" && trigger.action.name !== "On") {
                trigger.action.name = "Off";
                this.adapter.log.warn(
                  `Wrong action name ${JSON.stringify(trigger.action)} in ${id} - set Off`
                );
              }
            }
          }
          newTrigger.push(trigger);
        }
        val.triggers = newTrigger;
      } else if (val && (val.type === "TimeTrigger" || val.type === "AstroTrigger" || val.type === "OneTimeTrigger")) {
        this.adapter.log.debug(`Validation Trigger ${val.type}`);
        const trigger = val;
        if (trigger.type === "TimeTrigger") {
          if (trigger.hour == void 0 || trigger.hour < 0 || trigger.hour > 23) {
            this.adapter.log.warn(`Hour must be in range 0-23 - in ${id}`);
            trigger.hour = 0;
          }
          if (trigger.minute == void 0 || trigger.minute < 0 || trigger.minute > 59) {
            this.adapter.log.warn(`Minute must be in range 0-59 - in ${id}`);
            trigger.minute = 0;
          }
          if (trigger.weekdays) {
            trigger.weekdays = removeDuplicate(trigger.weekdays);
          }
          const t = await this.nextDateSwitch(/* @__PURE__ */ new Date(), trigger);
          const nextDate = t != void 0 ? new Date(t).getDay() : 0;
          trigger.todayTrigger = {
            hour: trigger.hour,
            minute: trigger.minute,
            weekday: nextDate,
            date: t
          };
          if (typeof trigger.weekdays !== "object" || trigger.weekdays.length === 0 || trigger.weekdays.length > 7) {
            this.adapter.log.error(`Empty weekday is not allowed in ${id}`);
            trigger.weekdays = [0];
          }
          if (trigger.todayTrigger == void 0) {
            trigger.todayTrigger = {};
          }
        } else if (trigger.type === "AstroTrigger") {
          if (trigger.astroTime == null || trigger.astroTime !== "sunrise" && trigger.astroTime !== "sunset" && trigger.astroTime !== "solarNoon" && trigger.astroTime !== "sunriseEnd" && trigger.astroTime !== "goldenHourEnd" && trigger.astroTime !== "goldenHour" && trigger.astroTime !== "sunsetStart" && trigger.astroTime !== "dusk" && trigger.astroTime !== "nauticalDusk" && trigger.astroTime !== "night" && trigger.astroTime !== "nadir" && trigger.astroTime !== "nightEnd" && trigger.astroTime !== "nauticalDawn" && trigger.astroTime !== "dawn") {
            this.adapter.log.warn(`Astro time may not be null - in ${id}`);
            trigger.astroTime = "sunrise";
          }
          if (trigger.shiftInMinutes == null || trigger.shiftInMinutes > 120 || trigger.shiftInMinutes < -120) {
            this.adapter.log.warn(`Shift in minutes must be in range -120 to 120 - in ${id}`);
            trigger.shiftInMinutes = 0;
          }
        } else if (trigger.type === "OneTimeTrigger") {
          if (isNaN(new Date(trigger.date).getTime())) {
            this.adapter.log.warn(`Wrong OneTimeDate ${trigger.date} in ${id}`);
            trigger.date = (/* @__PURE__ */ new Date()).toISOString();
          }
          if (trigger.timedate == null || typeof trigger.timedate !== "boolean") {
            this.adapter.log.warn(`Wrong timedate ${trigger.timedate} in ${id}`);
            trigger.timedate = true;
          }
        } else {
          this.adapter.log.error(`Cannot found trigger type ${trigger.type} in ${id}`);
          return val = {};
        }
        const objId = id.split(".");
        if (trigger.objectId.toString() != objId[3]) {
          this.adapter.log.warn(`Wrong ObjectId ${trigger.objectId} in ${id}`);
          trigger.objectId = parseInt(objId[3]);
        }
        if (trigger.valueCheck == null || typeof trigger.valueCheck !== "boolean") {
          trigger.valueCheck = false;
          this.adapter.log.warn(`Wrong valueCheck ${JSON.stringify(trigger)} in ${id}`);
        }
        if (!trigger.action) {
          trigger.action = {};
          this.adapter.log.warn(`Wrong action ${JSON.stringify(trigger)} in ${id}`);
        }
        if (trigger.action.type !== "OnOffStateAction") {
          if (trigger.action.type === "ConditionAction") {
            if (!trigger.action.condition) {
              this.adapter.log.warn(
                `Missing action condition ${JSON.stringify(trigger.action)} in ${id}`
              );
              return val = {};
            }
            if (trigger.action.condition.type !== "StringStateAndConstantCondition") {
              if (trigger.action.condition.constant == "") {
                trigger.action.condition.constant = "true";
                this.adapter.log.warn(
                  `Wrong condition constant ${JSON.stringify(trigger.action)} in ${id}! Set constant to TRUE!`
                );
              }
              if (!trigger.action.condition.stateId1 || !trigger.action.condition.stateId2) {
                this.adapter.log.warn(
                  `Missing action condition states1 or states2 ${JSON.stringify(trigger.action)} in ${id}`
                );
                return val = {};
              }
              const stateId1 = await this.adapter.getForeignObjectAsync(
                trigger.action.condition.stateId1
              );
              if (!stateId1) {
                this.adapter.log.warn(
                  `Wrong action condition states1 ${JSON.stringify(trigger.action)} in ${id}`
                );
                return val = {};
              }
              const stateId2 = await this.adapter.getForeignObjectAsync(
                trigger.action.condition.stateId2
              );
              if (!stateId2) {
                this.adapter.log.warn(
                  `Wrong action condition states2 ${JSON.stringify(trigger.action)} in ${id}`
                );
                return val = {};
              }
            } else if (trigger.action.condition.type !== "StringStateAndStateCondition") {
              if (!trigger.action.condition.stateId) {
                this.adapter.log.warn(
                  `Missing action condition states ${JSON.stringify(trigger.action)} in ${id}`
                );
                return val = {};
              }
              const stateId = await this.adapter.getForeignObjectAsync(trigger.action.condition.stateId);
              if (!stateId) {
                this.adapter.log.warn(
                  `Wrong action condition states ${JSON.stringify(trigger.action)} in ${id}`
                );
                return val = {};
              }
            } else {
              this.adapter.log.warn(
                `Wrong action condition string ${JSON.stringify(trigger.action)} in ${id}`
              );
              return val = {};
            }
            if (trigger.action.condition.sign !== "==" && trigger.action.condition.sign !== "!=") {
              trigger.action.condition.sign = "==";
              this.adapter.log.warn(`Wrong condition sign ${JSON.stringify(trigger.action)} in ${id}`);
            }
            if (!trigger.action.action) {
              trigger.action.action = {};
              this.adapter.log.warn(`Wrong action condition ${JSON.stringify(trigger.action)} in ${id}`);
            }
            if (trigger.action.action.type !== "OnOffStateAction") {
              trigger.action.action.type = "OnOffStateAction";
              this.adapter.log.warn(
                `Wrong action type ${JSON.stringify(trigger.action.action)} in ${id}`
              );
            }
            if (trigger.action.action.name !== "Off" && trigger.action.action.name !== "On") {
              trigger.action.action.name = "Off";
              this.adapter.log.warn(
                `Wrong action name ${JSON.stringify(trigger.action)} in ${id} - set Off`
              );
            }
          } else {
            trigger.action.type = "OnOffStateAction";
            this.adapter.log.warn(`Wrong action type ${JSON.stringify(trigger.action)} in ${id}`);
            if (trigger.action.name !== "Off" && trigger.action.name !== "On") {
              trigger.action.name = "Off";
              this.adapter.log.warn(
                `Wrong action name ${JSON.stringify(trigger.action)} in ${id} - set Off`
              );
            }
          }
        }
        val = trigger;
      } else {
        this.adapter.log.debug(`Cannot found triggers in ${id}`);
        val.triggers = [];
      }
    } else {
      this.adapter.log.error(`Cannot found OnOffSchedule in ${id}`);
      return val = {};
    }
    return val;
  }
  /**
   * Set next times
   *
   * @param check true/false
   */
  async setNextAstroTime(check) {
    const states = await this.adapter.getChannelsAsync();
    for (const ids of states) {
      const id = `${ids}.data`;
      const state = await this.adapter.getStateAsync(id);
      if (state) {
        if (typeof state.val === "string" && state.val.startsWith("{")) {
          const triggers = JSON.parse(state.val);
          if (triggers && triggers.triggers && triggers.triggers.length > 0) {
            let isChange = false;
            for (const trigger of triggers.triggers) {
              if (trigger && trigger.type === "AstroTrigger") {
                trigger.todayTrigger = await this.nextAstroDate(/* @__PURE__ */ new Date(), trigger);
                trigger.todayTrigger.date = await this.nextDateSwitch(/* @__PURE__ */ new Date(), trigger);
                const actual = new Date(trigger.todayTrigger.date);
                trigger.todayTrigger.hour = actual.getHours();
                trigger.todayTrigger.minute = actual.getMinutes();
                trigger.todayTrigger.weekday = actual.getDay();
                isChange = true;
                if (check) {
                  this.adapter.sendTo(this.adapter.namespace, "update-trigger", {
                    dataId: id,
                    trigger
                  });
                }
              }
            }
            if (isChange) {
              await this.adapter.setState(id, { val: JSON.stringify(triggers), ack: true });
            }
          }
        }
      }
    }
  }
  /**
   * Set action time
   */
  async setActionTime() {
    const allData = [];
    const states = await this.adapter.getChannelsAsync();
    for (const ids of states) {
      const id = `${ids}.data`;
      const state = await this.adapter.getStateAsync(id);
      if (state) {
        if (typeof state.val === "string" && state.val.startsWith("{")) {
          const triggers = JSON.parse(state.val);
          if (triggers && triggers.triggers && triggers.triggers.length > 0) {
            const enabled = await this.adapter.getStateAsync(id.replace(".data", ".enabled"));
            for (const trigger of triggers.triggers) {
              const switching = {
                type: trigger.type,
                name: triggers.name,
                triggerid: parseInt(trigger.id),
                action: trigger.action.type,
                states: triggers.onAction.idsOfStatesToSet,
                active: enabled && enabled.val ? true : false,
                hour: 0,
                minute: 0,
                day: 0,
                dateISO: "",
                timestamp: 0,
                objectId: trigger.objectId
              };
              const now = /* @__PURE__ */ new Date();
              if (trigger && trigger.type === "TimeTrigger") {
                let addDate = 0;
                if (trigger.hour === 0 && trigger.minute === 0) {
                  addDate = 1;
                }
                const switchTime = /* @__PURE__ */ new Date(
                  `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() + addDate} ${trigger.hour}:${trigger.minute}`
                );
                if (switchTime >= now && trigger.weekdays.includes(now.getDay())) {
                  switching.hour = trigger.hour;
                  switching.minute = trigger.minute;
                  switching.day = switchTime.getDate();
                  switching.dateISO = new Date(switchTime).toISOString();
                  switching.timestamp = switchTime.getTime();
                } else {
                  const t = await this.nextDateSwitch(/* @__PURE__ */ new Date(), trigger);
                  switching.hour = trigger.hour;
                  switching.minute = trigger.minute;
                  switching.day = new Date(t).getDate();
                  switching.dateISO = t;
                  switching.timestamp = new Date(t).getTime();
                }
              } else if (trigger && trigger.type === "AstroTrigger") {
                if (trigger.weekdays.includes(now.getDay())) {
                  trigger.todayTrigger = await this.nextAstroDate(/* @__PURE__ */ new Date(), trigger);
                  switching.hour = trigger.todayTrigger.hour;
                  switching.minute = trigger.todayTrigger.minute;
                  switching.day = now.getDate();
                  switching.dateISO = trigger.date;
                  switching.timestamp = new Date(trigger.date).getTime();
                } else {
                  const t = await this.nextDateSwitch(/* @__PURE__ */ new Date(), trigger);
                  trigger.todayTrigger = await this.nextAstroDate(new Date(t), trigger);
                  switching.hour = trigger.todayTrigger.hour;
                  switching.minute = trigger.todayTrigger.minute;
                  switching.day = new Date(trigger.todayTrigger.date).getDate();
                  switching.dateISO = t;
                  switching.timestamp = new Date(trigger.todayTrigger.date).getTime();
                }
              } else if (trigger && trigger.type === "OneTimeTrigger") {
                if (new Date(trigger.date) >= now) {
                  const d = new Date(trigger.date);
                  switching.hour = d.getHours();
                  switching.minute = d.getMinutes();
                  switching.day = new Date(trigger.date).getDate();
                  switching.dateISO = trigger.date;
                  switching.timestamp = new Date(trigger.date).getTime();
                }
              }
              if (switching.timestamp > 0) {
                allData.push(switching);
              }
            }
          }
        }
      }
    }
    if (allData.length > 0) {
      const data = allData.sort((a, b) => a.timestamp - b.timestamp);
      await this.adapter.setState("nextEvents", { val: JSON.stringify(data), ack: true });
    }
  }
  /**
   * nextDateSwitch
   *
   * @param now Date
   * @param trigger AllTriggers
   * @returns next date switch
   */
  async nextDateSwitch(now, trigger) {
    const hour = trigger.hour != null ? trigger.hour : trigger.todayTrigger.hour;
    const minute = trigger.minute != null ? trigger.minute : trigger.todayTrigger.minute;
    const oldNow = /* @__PURE__ */ new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${hour}:${minute}`);
    if (oldNow > now) {
      return (/* @__PURE__ */ new Date(
        `${oldNow.getFullYear()}-${oldNow.getMonth() + 1}-${oldNow.getDate()} ${hour}:${minute}`
      )).toISOString();
    }
    let diffDays = 0;
    const nextDay = trigger.weekdays.length === 1 ? trigger.weekdays[0] : await this.nextActiveDay(trigger.weekdays, now.getDay());
    if (nextDay > now.getDay()) {
      diffDays = nextDay - now.getDay();
    } else {
      diffDays = nextDay + 7 - now.getDay();
    }
    const next = new Date(now.setDate(now.getDate() + diffDays));
    return (/* @__PURE__ */ new Date(
      `${next.getFullYear()}-${next.getMonth() + 1}-${next.getDate()} ${hour}:${minute}`
    )).toISOString();
  }
  /**
   * Next switch
   *
   * @param date Date
   * @param data trigger
   * @returns next date
   */
  nextAstroDate(date, data) {
    const next = (0, import_suncalc.getTimes)(date, this.coordinate.getLatitude(), this.coordinate.getLongitude());
    let astro;
    switch (data.astroTime) {
      case "sunrise":
        astro = next[import_AstroTime.AstroTime.Sunrise];
        break;
      case "solarNoon":
        astro = next[import_AstroTime.AstroTime.SolarNoon];
        break;
      case "sunset":
        astro = next[import_AstroTime.AstroTime.Sunset];
        break;
      case "sunriseEnd":
        astro = next[import_AstroTime.AstroTime.SunriseEnd];
        break;
      case "goldenHourEnd":
        astro = next[import_AstroTime.AstroTime.GoldenHourEnd];
        break;
      case "goldenHour":
        astro = next[import_AstroTime.AstroTime.GoldenHour];
        break;
      case "sunsetStart":
        astro = next[import_AstroTime.AstroTime.SunsetStart];
        break;
      case "dusk":
        astro = next[import_AstroTime.AstroTime.Dusk];
        break;
      case "nauticalDusk":
        astro = next[import_AstroTime.AstroTime.NauticalDusk];
        break;
      case "night":
        astro = next[import_AstroTime.AstroTime.Night];
        break;
      case "nadir":
        astro = next[import_AstroTime.AstroTime.Nadir];
        break;
      case "nightEnd":
        astro = next[import_AstroTime.AstroTime.NightEnd];
        break;
      case "nauticalDawn":
        astro = next[import_AstroTime.AstroTime.NauticalDawn];
        break;
      case "dawn":
        astro = next[import_AstroTime.AstroTime.Dawn];
        break;
      default:
        astro = next[import_AstroTime.AstroTime.Sunset];
    }
    new Date(astro.getTime()).setMinutes(
      new Date(astro.getTime()).getMinutes() + (data.shiftInMinutes != null ? data.shiftInMinutes : 0)
    );
    return Promise.resolve({
      hour: astro.getHours(),
      minute: astro.getMinutes(),
      weekday: astro.getDay(),
      date: astro
    });
  }
  /**
   * Next switch
   *
   * @param array number
   * @param day getDay()
   * @returns next getDay
   */
  nextActiveDay(array, day) {
    array = array.map((val) => {
      return val === 0 ? 7 : val;
    });
    const numChecker = (num) => array.find((v) => v > num);
    const next = numChecker(day);
    return Promise.resolve(next == void 0 ? 0 : next);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  IoBrokerValidationState
});
//# sourceMappingURL=IoBrokerValidationState.js.map
