"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var fs = __toESM(require("fs"));
var import_node_schedule = require("node-schedule");
var import_suncalc = require("suncalc");
var import_Coordinate = require("./Coordinate");
var import_AstroTriggerScheduler = require("./scheduler/AstroTriggerScheduler");
var import_OneTimeTriggerScheduler = require("./scheduler/OneTimeTriggerScheduler");
var import_TimeTriggerScheduler = require("./scheduler/TimeTriggerScheduler");
var import_UniversalTriggerScheduler = require("./scheduler/UniversalTriggerScheduler");
var import_AstroTriggerSerializer = require("./serialization/AstroTriggerSerializer");
var import_ConditionActionSerializer = require("./serialization/ConditionActionSerializer");
var import_StringStateAndConstantConditionSerializer = require("./serialization/conditions/StringStateAndConstantConditionSerializer");
var import_StringStateAndStateConditionSerializer = require("./serialization/conditions/StringStateAndStateConditionSerializer");
var import_OneTimeTriggerSerializer = require("./serialization/OneTimeTriggerSerializer");
var import_OnOffScheduleSerializer = require("./serialization/OnOffScheduleSerializer");
var import_OnOffStateActionSerializer = require("./serialization/OnOffStateActionSerializer");
var import_TimeTriggerSerializer = require("./serialization/TimeTriggerSerializer");
var import_UniversalSerializer = require("./serialization/UniversalSerializer");
var import_IoBrokerLoggingService = require("./services/IoBrokerLoggingService");
var import_IoBrokerStateService = require("./services/IoBrokerStateService");
var import_MessageService = require("./services/MessageService");
class ScheduleSwitcher extends utils.Adapter {
  scheduleIdToSchedule = /* @__PURE__ */ new Map();
  loggingService = new import_IoBrokerLoggingService.IoBrokerLoggingService(this);
  stateService = new import_IoBrokerStateService.IoBrokerStateService(this);
  coordinate;
  messageService;
  widgetControl;
  constructor(options = {}) {
    super({
      ...options,
      name: "schedule-switcher"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("message", this.onMessage.bind(this));
    this.on("unload", this.onUnload.bind(this));
    this.widgetControl = null;
  }
  getEnabledIdFromScheduleId(scheduleId) {
    return scheduleId.replace("data", "enabled");
  }
  getScheduleIdFromEnabledId(scheduleId) {
    return scheduleId.replace("enabled", "data");
  }
  /**
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    this.config.schedules.onOff = await this.checkConfig(this.config.schedulesData);
    await this.initMessageService();
    await this.fixStateStructure(this.config.schedules);
    await this.fixViewStructure();
    const record = await this.getStatesAsync(`schedule-switcher.${this.instance}.*.data`);
    for (const id in record) {
      const state = record[id];
      this.log.debug(`got state: ${state ? JSON.stringify(state) : "null"} with id: ${id}`);
      if (state) {
        this.log.info("ID: " + id);
        if (typeof state.val === "string" && state.val.startsWith("{")) {
          const stateVal = JSON.parse(state.val);
          await this.stateCheck(id, stateVal);
          if (typeof stateVal === "object" && Object.keys(stateVal).length > 0) {
            this.onScheduleChange(id, JSON.stringify(stateVal));
          } else {
            this.log.error(`Skip id ${id} - Wrong values!!`);
          }
        } else {
          this.log.error(`Could not retrieve state for ${id}`);
        }
      } else {
        this.log.error(`Could not retrieve state for ${id}`);
      }
    }
    this.subscribeStates(`*`);
    this.widgetControl = this.setInterval(
      () => {
        this.fixViewStructure();
      },
      24 * 60 * 1e3 * 60
    );
  }
  async stateCheck(id, val) {
    if (val.type && val.type == "OnOffSchedule") {
      if (val.onAction) {
        if (val.onAction.type == "OnOffStateAction") {
          if (val.onAction.type.valueType == "boolean") {
            val.onAction.type.onValue = true;
            val.onAction.type.offValue = false;
            if (typeof val.onAction.type.booleanValue !== "boolean") {
              this.log.warn(`Value of ${id} is changed to false`);
              val.onAction.type.booleanValue = false;
            }
          } else if (val.onAction.type.valueType == "number") {
            if (typeof val.onAction.type.onValue !== "number") {
              this.log.warn(`Value of ${id} is changed to 0`);
              val.onAction.type.booleanValue = 0;
            }
            if (typeof val.onAction.type.offValue !== "number") {
              this.log.warn(`Value of ${id} is changed to 10`);
              val.onAction.type.booleanValue = 10;
            }
            if (typeof val.onAction.type.booleanValue !== "number") {
              this.log.warn(`Value of ${id} is changed to 0`);
              val.onAction.type.booleanValue = 0;
            }
          } else if (val.onAction.type.valueType == "string") {
            if (typeof val.onAction.type.onValue !== "string") {
              this.log.warn(`Value of ${id} is changed to empty`);
              val.onAction.type.booleanValue = "";
            }
            if (typeof val.onAction.type.offValue !== "string") {
              this.log.warn(`Value of ${id} is changed to empty`);
              val.onAction.type.booleanValue = "";
            }
            if (typeof val.onAction.type.booleanValue !== "string") {
              this.log.warn(`Value of ${id} is changed to empty`);
              val.onAction.type.booleanValue = "";
            }
            if (typeof val.onAction.type.idsOfStatesToSet === "object") {
              const ids = [];
              for (const state of val.onAction.type.idsOfStatesToSet) {
                const value = await this.getForeignObjectAsync(state);
                if (value) {
                  ids.push(state);
                } else {
                  this.log.error(`Requested state ${id} returned null/undefined!`);
                }
              }
              val.onAction.type.idsOfStatesToSet = ids;
            } else {
              val.onAction.type.idsOfStatesToSet = [];
              this.log.warn(`The states are not objects, changed ${id} to empty`);
            }
          }
        } else {
          this.log.error(`Cannot found onAction type 'OnOffStateAction' in ${id}`);
          val = {};
          return;
        }
      } else {
        this.log.error(`Cannot found onAction in ${id}`);
        val = {};
        return;
      }
      if (val.offAction) {
        if (val.offAction.type == "OnOffStateAction") {
          if (val.offAction.type.valueType == "boolean") {
            val.offAction.type.onValue = true;
            val.offAction.type.offValue = false;
            if (typeof val.offAction.type.booleanValue !== "boolean") {
              this.log.warn(`Value of ${id} is changed to false`);
              val.offAction.type.booleanValue = false;
            }
          } else if (val.offAction.type.valueType == "number") {
            if (typeof val.offAction.type.onValue !== "number") {
              this.log.warn(`Value of ${id} is changed to 0`);
              val.offAction.type.booleanValue = 0;
            }
            if (typeof val.offAction.type.offValue !== "number") {
              this.log.warn(`Value of ${id} is changed to 10`);
              val.offAction.type.booleanValue = 10;
            }
            if (typeof val.offAction.type.booleanValue !== "number") {
              this.log.warn(`Value of ${id} is changed to 0`);
              val.offAction.type.booleanValue = 0;
            }
          } else if (val.offAction.type.valueType == "string") {
            if (typeof val.offAction.type.onValue !== "string") {
              this.log.warn(`Value of ${id} is changed to empty`);
              val.offAction.type.booleanValue = "";
            }
            if (typeof val.offAction.type.offValue !== "string") {
              this.log.warn(`Value of ${id} is changed to empty`);
              val.offAction.type.booleanValue = "";
            }
            if (typeof val.offAction.type.booleanValue !== "string") {
              this.log.warn(`Value of ${id} is changed to empty`);
              val.offAction.type.booleanValue = "";
            }
            if (typeof val.offAction.type.idsOfStatesToSet === "object") {
              const ids = [];
              for (const state of val.offAction.type.idsOfStatesToSet) {
                const value = await this.getForeignObjectAsync(state);
                if (value) {
                  ids.push(state);
                } else {
                  this.log.error(`Requested state ${id} returned null/undefined!`);
                }
              }
              val.offAction.type.idsOfStatesToSet = ids;
            } else {
              val.offAction.type.idsOfStatesToSet = [];
              this.log.warn(`The states are not objects, changed ${id} to empty`);
            }
          }
        } else {
          this.log.error(`Cannot found offAction type 'OnOffStateAction' in ${id}`);
          val = {};
          return;
        }
      } else {
        this.log.error(`Cannot found offAction in ${id}`);
        val = {};
        return;
      }
      if (val.triggers && typeof val.triggers === "object" && val.triggers.length > 0) {
        const newTrigger = [];
        for (const trigger of val.triggers) {
          if (trigger.type === "TimeTrigger") {
            if (trigger.hour == void 0 || trigger.hour < 0 || trigger.hour > 23) {
              this.log.warn(`Hour must be in range 0-23 - in ${id}`);
              trigger.hour = 0;
            }
            if (trigger.minute == void 0 || trigger.minute < 0 || trigger.minute > 59) {
              this.log.warn(`Minute must be in range 0-59 - in ${id}`);
              trigger.minute = 0;
            }
            if (typeof trigger.weekdays !== "object" || trigger.weekdays.length === 0 || trigger.weekdays.length > 7) {
              this.log.error(`Empty weekday is not allowed in ${id}`);
              trigger.weekdays = [0];
            }
          } else if (trigger.type === "AstroTrigger") {
            if (trigger.astroTime == null || trigger.astroTime !== "sunrise" && trigger.astroTime !== "sunset" && trigger.astroTime !== "solarNoon") {
              this.log.warn(`Astro time may not be null - in ${id}`);
              trigger.trigger.astroTime = "sunrise";
            }
            if (trigger.shiftInMinutes == null || trigger.shiftInMinutes > 120 || trigger.shiftInMinutes < -120) {
              this.log.warn(`Shift in minutes must be in range -120 to 120 - in ${id}`);
              trigger.shiftInMinutes = 0;
            }
          } else if (trigger.type === "OneTimeTrigger") {
            if (isNaN(new Date(trigger.date).getTime())) {
              this.log.warn(`Wrong OneTimeDate ${trigger.date} in ${id}`);
              trigger.date = (/* @__PURE__ */ new Date()).toISOString();
            }
            if (trigger.timedate == null || typeof trigger.timedate !== "boolean") {
              this.log.warn(`Wrong timedate ${trigger.timedate} in ${id}`);
              trigger.timedate = true;
            }
          } else {
            this.log.error(`Cannot found trigger type ${trigger.type} in ${id}`);
            val = {};
            return;
          }
          const objId = id.split(".");
          if (trigger.objectId.toString() != objId[3]) {
            this.log.warn(`Wrong ObjectId ${trigger.objectId} in ${id}`);
            trigger.objectId = parseInt(objId[3]);
          }
          if (!trigger.action) {
            trigger.action = {};
            this.log.warn(`Wrong action ${JSON.stringify(trigger)} in ${id}`);
          }
          if (trigger.action.type !== "OnOffStateAction") {
            if (trigger.action.type === "ConditionAction") {
              if (!trigger.action.condition) {
                val = {};
                this.log.warn(`Missing action condition ${JSON.stringify(trigger.action)} in ${id}`);
                return;
              }
              if (trigger.action.condition.type !== "StringStateAndConstantCondition") {
                if (trigger.action.condition.constant !== "true") {
                  trigger.action.condition.constant = "true";
                  this.log.warn(
                    `Wrong condition constant ${JSON.stringify(trigger.action)} in ${id}`
                  );
                }
                if (!trigger.action.condition.stateId1 || !trigger.action.condition.stateId2) {
                  val = {};
                  this.log.warn(
                    `Missing action condition states1 or states2 ${JSON.stringify(trigger.action)} in ${id}`
                  );
                  return;
                }
                const stateId1 = await this.getForeignObjectAsync(trigger.action.condition.stateId1);
                if (!stateId1) {
                  val = {};
                  this.log.warn(
                    `Wrong action condition states1 ${JSON.stringify(trigger.action)} in ${id}`
                  );
                  return;
                }
                const stateId2 = await this.getForeignObjectAsync(trigger.action.condition.stateId2);
                if (!stateId2) {
                  val = {};
                  this.log.warn(
                    `Wrong action condition states2 ${JSON.stringify(trigger.action)} in ${id}`
                  );
                  return;
                }
              } else if (trigger.action.condition.type !== "StringStateAndStateCondition") {
                if (!trigger.action.condition.stateId) {
                  val = {};
                  this.log.warn(
                    `Missing action condition states ${JSON.stringify(trigger.action)} in ${id}`
                  );
                  return;
                }
                const stateId = await this.getForeignObjectAsync(trigger.action.condition.stateId);
                if (!stateId) {
                  val = {};
                  this.log.warn(
                    `Wrong action condition states ${JSON.stringify(trigger.action)} in ${id}`
                  );
                  return;
                }
              } else {
                val = {};
                this.log.warn(
                  `Wrong action condition string ${JSON.stringify(trigger.action)} in ${id}`
                );
                return;
              }
              if (trigger.action.condition.sign !== "==" && trigger.action.condition.sign !== "!=") {
                trigger.action.condition.sign = "==";
                this.log.warn(`Wrong condition sign ${JSON.stringify(trigger.action)} in ${id}`);
              }
              if (!trigger.action.action) {
                trigger.action.action = {};
                this.log.warn(`Wrong action condition ${JSON.stringify(trigger.action)} in ${id}`);
              }
              if (trigger.action.action.type !== "OnOffStateAction") {
                trigger.action.action.type = "OnOffStateAction";
                this.log.warn(`Wrong action type ${JSON.stringify(trigger.action.action)} in ${id}`);
              }
              if (trigger.action.action.name !== "Off" && trigger.action.action.name !== "On") {
                trigger.action.action.name = "Off";
                this.log.warn(`Wrong action name ${JSON.stringify(trigger.action)} in ${id} - set Off`);
              }
            } else {
              trigger.action.type = "OnOffStateAction";
              this.log.warn(`Wrong action type ${JSON.stringify(trigger.action)} in ${id}`);
              if (trigger.action.name !== "Off" && trigger.action.name !== "On") {
                trigger.action.name = "Off";
                this.log.warn(`Wrong action name ${JSON.stringify(trigger.action)} in ${id} - set Off`);
              }
            }
          }
          newTrigger.push(trigger);
        }
        val.triggers = newTrigger;
      } else {
        this.log.debug(`Cannot found triggers in ${id}`);
        val.triggers = [];
      }
    } else {
      this.log.error(`Cannot found OnOffSchedule in ${id}`);
      val = {};
      return;
    }
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   */
  onUnload(callback) {
    var _a, _b;
    this.log.info("cleaning everything up...");
    this.widgetControl && this.clearInterval(this.widgetControl);
    (_a = this.messageService) == null ? void 0 : _a.destroy();
    this.stateService.destroy();
    for (const id in this.scheduleIdToSchedule.keys()) {
      try {
        (_b = this.scheduleIdToSchedule.get(id)) == null ? void 0 : _b.destroy();
      } catch (e) {
        this.log.error(`scheduleIdToSchedule: ${e}`);
      }
    }
    try {
      this.scheduleIdToSchedule.clear();
    } catch (e) {
      this.log.error(`scheduleIdToSchedule clear: ${e}`);
    } finally {
      callback();
    }
  }
  async checkConfig(config) {
    if (config && config.length > 0) {
      const allIds = [];
      for (const state of config) {
        if (state && state.stateId != null) {
          if (!allIds.includes(state.stateId)) {
            allIds.push(state.stateId);
          } else {
            state.stateId = null;
            this.log.error(`Double stateId is not allowed!!!`);
          }
        }
      }
      let isChange = false;
      for (const state of config) {
        let count = 0;
        if (state.stateId == null) {
          const nextid = await this.nextId(allIds, 0);
          state.stateId = nextid;
          allIds.push(nextid);
          count = nextid;
          isChange = true;
        } else {
          count = state.stateId;
        }
        const check = await this.getStateAsync(`schedule-switcher.0.onoff.${count}.data`);
        const enabled = await this.getStateAsync(`schedule-switcher.0.onoff.${count}.enabled`);
        if (check && check.val != null && typeof check.val === "string") {
          const json = JSON.parse(check.val);
          state.count = json.triggers.length;
          state.objectid = `schedule-switcher.0.onoff.${count}.data`;
          state.objectname = json.name;
        }
        if (enabled && enabled.val != null) {
          state.active = enabled.val.toString();
        }
      }
      if (isChange) {
        this.log.info("Cleanup native...restart adapter now..." + JSON.stringify(config));
        await this.extendForeignObjectAsync(`system.adapter.${this.namespace}`, {
          native: { schedulesData: config, schedules: { onOff: allIds } }
        });
      }
      return allIds;
    }
  }
  async nextId(ids, start) {
    ids.every((a) => {
      if (start === a) {
        start = a + 1;
        return true;
      }
    });
    return start;
  }
  // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
  // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
  // /**
  //  * Is called if a subscribed object changes
  //  */
  // private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
  //     if (obj) {
  //         // The object was changed
  //         this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
  //     } else {
  //         // The object was deleted
  //         this.log.info(`object ${id} deleted`);
  //     }
  // }
  /**
   * Is called if a subscribed state changes
   */
  async onStateChange(id, state) {
    var _a;
    if (state) {
      if (!state.ack) {
        const command = id.split(".").pop();
        if (command === "data") {
          this.log.debug("is schedule id start");
          await this.onScheduleChange(id, state.val);
          this.log.debug("is schedule id end");
        } else if (command === "enabled") {
          this.log.debug("is enabled id start");
          const dataId = this.getScheduleIdFromEnabledId(id);
          const scheduleData = (_a = await this.getStateAsync(dataId)) == null ? void 0 : _a.val;
          await this.onScheduleChange(dataId, scheduleData);
          this.log.debug("is enabled id end");
        } else if (command === "sendto" && typeof state.val === "string") {
          this.log.debug("is sendto id");
          this.setSendTo(state.val);
        }
        this.stateService.setState(id, state.val, true);
      }
    }
  }
  // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
  /**
   * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
   * Using this method requires "common.messagebox" property to be set to true in io-package.json
   */
  async onMessage(obj) {
    if (typeof obj === "object" && obj.message) {
      try {
        this.log.debug("obj: " + JSON.stringify(obj));
        switch (obj.command) {
          case "getActiv":
            if (obj && obj.message && obj.message.schedule != null) {
              this.loadData(obj, 1);
            } else {
              this.sendTo(obj.from, obj.command, `false`, obj.callback);
            }
            break;
          case "getNameSchedule":
            if (obj && obj.message && obj.message.schedule != null) {
              this.loadData(obj, 4);
            } else {
              this.sendTo(obj.from, obj.command, `New Schedule`, obj.callback);
            }
            break;
          case "getCountSchedule":
            if (obj && obj.message && obj.message.schedule != null) {
              this.loadData(obj, 3);
            } else {
              this.sendTo(obj.from, obj.command, `0`, obj.callback);
            }
            break;
          case "getIdNameSchedule":
            if (obj && obj.message && obj.message.schedule != null) {
              this.loadData(obj, 2);
            } else {
              this.sendTo(
                obj.from,
                obj.command,
                `schedule-switcher.0.onoff.<set after restart>.data`,
                obj.callback
              );
            }
            break;
          case "add-trigger":
          case "add-one-time-trigger":
          case "update-one-time-trigger":
          case "update-trigger":
          case "delete-trigger":
          case "change-name":
          case "enable-schedule":
          case "disable-schedule":
          case "change-switched-values":
          case "change-switched-ids":
          case "change-view-dataId":
            if (this.messageService) {
              if (obj.message && obj.message.parameter && obj.command === "add-trigger" && obj.callback) {
                this.addNewTrigger(obj);
                return;
              }
              if (obj.message && obj.message.parameter)
                obj.message = obj.message.parameter;
              await this.messageService.handleMessage(obj);
            } else {
              this.log.error("Message service not initialized");
            }
            break;
          default:
            this.log.error(`Message service ${obj.command} not initialized`);
        }
      } catch (e) {
        this.log.error(`Could not handle message:`);
      }
    }
  }
  async loadData(obj, answer) {
    const id = obj.message.schedule;
    const check = await this.getStateAsync(`schedule-switcher.0.onoff.${id}.data`);
    if (check && check.val) {
      if (answer === 1) {
        const enabled = await this.getStateAsync(`schedule-switcher.0.onoff.${id}.enabled`);
        if (enabled && enabled.val != null) {
          this.sendTo(obj.from, obj.command, enabled.val.toString(), obj.callback);
        }
      } else if (answer === 2) {
        this.sendTo(obj.from, obj.command, `schedule-switcher.0.onoff.${id}.data`, obj.callback);
      } else if (answer === 3) {
        if (typeof check.val === "string") {
          const json = JSON.parse(check.val);
          this.sendTo(obj.from, obj.command, `${json.triggers.length}`, obj.callback);
        }
      } else if (answer === 4) {
        if (typeof check.val === "string") {
          const json = JSON.parse(check.val);
          this.sendTo(obj.from, obj.command, `${json.name}`, obj.callback);
        }
      }
    }
  }
  async addNewTrigger(obj) {
    obj.message = obj.message.parameter;
    const data = await this.getStateAsync(obj.message.dataId);
    const data_json = data && typeof data.val === "string" ? JSON.parse(data.val) : null;
    if (data_json && this.messageService) {
      this.sendTo(obj.from, obj.command, data_json.triggers.length, obj.callback);
      await this.messageService.handleMessage(obj);
    } else {
      this.sendTo(obj.from, obj.command, null, obj.callback);
    }
  }
  //------------------------------------------------------------------------------------------------------------------
  // Private helper methods
  //------------------------------------------------------------------------------------------------------------------
  async initMessageService() {
    this.messageService = new import_MessageService.MessageService(
      this.stateService,
      this.scheduleIdToSchedule,
      this.createNewOnOffScheduleSerializer.bind(this),
      this,
      await this.getCoordinate()
    );
  }
  async fixViewStructure() {
    this.log.info("Start Widget control!");
    const visFolder = [];
    const allVisViews = {};
    const newViews = {};
    const allVIS = await this.getObjectViewAsync("system", "instance", {
      startkey: "system.adapter.vis.",
      endkey: "system.adapter.vis.\u9999"
    });
    const allVIS2 = await this.getObjectViewAsync("system", "instance", {
      startkey: "system.adapter.vis-2.",
      endkey: "system.adapter.vis-2.\u9999"
    });
    if (allVIS2 && allVIS2.rows) {
      for (const id of allVIS2.rows) {
        visFolder.push(id.id.replace("system.adapter.", ""));
      }
    }
    if (allVIS && allVIS.rows) {
      for (const id of allVIS.rows) {
        visFolder.push(id.id.replace("system.adapter.", ""));
      }
    }
    if (visFolder.length > 0) {
      const path = `${utils.getAbsoluteDefaultDataDir()}files/`;
      for (const vis of visFolder) {
        allVisViews[vis] = {};
        const folders = fs.readdirSync(`${path}${vis}/`);
        for (const folder of folders) {
          if (fs.statSync(`${path}${vis}/${folder}`).isDirectory()) {
            if (fs.existsSync(`${path}${vis}/${folder}/vis-views.json`)) {
              const valViews = fs.readFileSync(`${path}${vis}/${folder}/vis-views.json`, "utf-8");
              if (valViews.indexOf("tplSchedule-switcherDevicePlan") !== -1) {
                const templates = JSON.parse(valViews);
                allVisViews[vis][folder] = {};
                for (const template in templates) {
                  if (templates[template].widgets && JSON.stringify(templates[template].widgets).indexOf(
                    "tplSchedule-switcherDevicePlan"
                  ) !== -1) {
                    allVisViews[vis][folder][template] = [];
                    for (const widget in templates[template].widgets) {
                      if (templates[template].widgets[widget].tpl === "tplSchedule-switcherDevicePlan") {
                        if (templates[template].widgets[widget].data["oid-dataId"] != "" && !newViews[templates[template].widgets[widget].data["oid-dataId"]]) {
                          newViews[templates[template].widgets[widget].data["oid-dataId"]] = {};
                          newViews[templates[template].widgets[widget].data["oid-dataId"]][vis] = {};
                          newViews[templates[template].widgets[widget].data["oid-dataId"]][vis][folder] = {};
                          newViews[templates[template].widgets[widget].data["oid-dataId"]][vis][folder][widget] = {
                            prefix: folder,
                            namespace: vis,
                            view: template,
                            widgetId: widget,
                            newId: templates[template].widgets[widget].data["oid-dataId"]
                          };
                        } else if (templates[template].widgets[widget].data["oid-dataId"] != "") {
                          if (!newViews[templates[template].widgets[widget].data["oid-dataId"]][vis])
                            newViews[templates[template].widgets[widget].data["oid-dataId"]][vis] = {};
                          if (!newViews[templates[template].widgets[widget].data["oid-dataId"]][vis][folder])
                            newViews[templates[template].widgets[widget].data["oid-dataId"]][vis][folder] = {};
                          newViews[templates[template].widgets[widget].data["oid-dataId"]][vis][folder][widget] = {
                            prefix: folder,
                            namespace: vis,
                            view: template,
                            widgetId: widget,
                            newId: templates[template].widgets[widget].data["oid-dataId"]
                          };
                        }
                        if (!templates[template].widgets[widget].data["oid-dataId"] || templates[template].widgets[widget].data["oid-dataId"] == "") {
                          this.log.warn(
                            `Missing dataId for ${widget} - ${template} - ${folder} - ${vis}`
                          );
                        }
                        if (!templates[template].widgets[widget].data["oid-stateId1"] || templates[template].widgets[widget].data["oid-stateId1"] == "") {
                          this.log.warn(
                            `Missing stateId for ${widget} - ${template} - ${folder} - ${vis}`
                          );
                        }
                        if (!templates[template].widgets[widget].data["oid-enabled"] || templates[template].widgets[widget].data["oid-enabled"] == "") {
                          this.log.warn(
                            `Missing oid-enabledId for ${widget} - ${template} - ${folder} - ${vis}`
                          );
                        }
                        if (templates[template].widgets[widget].data["oid-dataId"] && templates[template].widgets[widget].data["oid-enabled"] && templates[template].widgets[widget].data["oid-dataId"] != "" && templates[template].widgets[widget].data["oid-enabled"] != "") {
                          const splitDataId = templates[template].widgets[widget].data["oid-dataId"].split(
                            "."
                          );
                          const splitEnabledId = templates[template].widgets[widget].data["oid-enabled"].split(
                            "."
                          );
                          if (splitDataId.length != 5 || splitDataId[4] != "data") {
                            this.log.warn(
                              `Wrong dataId ${templates[template].widgets[widget].data["oid-dataId"]} for ${widget} - ${template} - ${folder} - ${vis}`
                            );
                          }
                          if (splitEnabledId.length != 5 || splitEnabledId[4] != "enabled") {
                            this.log.warn(
                              `Wrong dataId ${templates[template].widgets[widget].data["oid-enabled"]} for ${widget} - ${template} - ${folder} - ${vis}`
                            );
                          }
                          if (splitEnabledId[3] != splitDataId[3]) {
                            this.log.warn(
                              `Wrong dataId and enabledID ${templates[template].widgets[widget].data["oid-dataId"]} - ${templates[template].widgets[widget].data["oid-enabled"]} for ${widget} - ${template} - ${folder} - ${vis}`
                            );
                          }
                        }
                        const wid = {};
                        wid[widget] = templates[template].widgets[widget];
                        allVisViews[vis][folder][template].push(wid);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    this.log.debug("newViews: " + JSON.stringify(newViews));
    if (Object.keys(newViews).length > 0) {
      for (const stateId in newViews) {
        const id = stateId.replace("data", "views");
        await this.setState(id, { val: JSON.stringify(newViews[stateId]), ack: true });
      }
    }
  }
  async fixStateStructure(statesInSettings) {
    if (!statesInSettings) {
      statesInSettings = { onOff: [] };
    }
    if (!statesInSettings.onOff) {
      statesInSettings.onOff = [];
    }
    const prefix = `schedule-switcher.${this.instance}.`;
    const currentStates = await this.getStatesAsync(`${prefix}*.data`);
    for (const fullId in currentStates) {
      const split = fullId.split(".");
      const type = split[2];
      const id = Number.parseInt(split[3], 10);
      if (type == "onoff") {
        if (statesInSettings.onOff.includes(id)) {
          statesInSettings.onOff = statesInSettings.onOff.filter((i) => i !== id);
          this.log.debug("Found state " + fullId);
        } else {
          this.log.debug("Deleting state " + fullId);
          await this.deleteOnOffSchedule(id);
        }
      }
    }
    for (const i of statesInSettings.onOff) {
      this.log.debug("Onoff state " + i + " not found, creating");
      await this.createOnOffSchedule(i);
    }
  }
  async deleteOnOffSchedule(id) {
    await this.delObjectAsync(`onoff.${id.toString()}`, { recursive: true });
  }
  async createOnOffSchedule(id) {
    await this.setObjectNotExistsAsync("onoff", {
      type: "device",
      common: {
        name: "onoff",
        desc: "Created by Adapter"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync(`onoff.${id.toString()}`, {
      type: "channel",
      common: {
        name: "New Schedule",
        desc: "Created by Adapter"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync(`onoff.${id.toString()}.data`, {
      type: "state",
      common: {
        name: "New Schedule",
        read: true,
        write: true,
        type: "string",
        role: "json",
        def: `{
                    "type": "OnOffSchedule",
                    "name": "New Schedule",
                    "objectID": ${id},
                    "onAction": {
                        "type":"OnOffStateAction",
                        "valueType":"boolean",
                        "onValue":true,
                        "offValue":false,
                        "booleanValue":true,
                        "idsOfStatesToSet":["default.state"]
                        },
                    "offAction": {
                        "type":"OnOffStateAction",
                        "valueType":"boolean",
                        "onValue":true,
                        "offValue":false,
                        "booleanValue":false,
                        "idsOfStatesToSet":["default.state"]
                    },
                    "triggers":[]
                }`.replace(/\s/g, ""),
        desc: "Contains the schedule data (triggers, etc.)"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync(`onoff.${id.toString()}.views`, {
      type: "state",
      common: {
        name: {
          en: "Created widgets",
          de: "Erstellte Widgets",
          ru: "\u0421\u043E\u0437\u0434\u0430\u043D\u043D\u044B\u0435 \u0432\u0438\u0434\u0436\u0435\u0442\u044B",
          pt: "Widgets criados",
          nl: "Aangemaakte widgets",
          fr: "Cr\xE9ation de widgets",
          it: "Widget creati",
          es: "Widgets creados",
          pl: "Tworzone wid\u017Cety",
          uk: "\u0421\u0442\u0432\u043E\u0440\u0435\u043D\u0456 \u0432\u0456\u0434\u0436\u0435\u0442\u0438",
          "zh-cn": "\u521B\u5EFA\u90E8\u4EF6"
        },
        read: true,
        write: false,
        type: "string",
        role: "json",
        def: `{}`,
        desc: "Contains all widgets"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync(`onoff.${id.toString()}.enabled`, {
      type: "state",
      common: {
        name: {
          en: "enable/disable",
          de: "aktivieren/deaktivieren",
          ru: "\u0432\u043A\u043B\u044E\u0447\u0438\u0442\u044C/\u043E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C",
          pt: "ativar/desativar",
          nl: "inschakelen/uitschakelen",
          fr: "activer/d\xE9sactiver",
          it: "abilitare/disabilitare",
          es: "habilitar/deshabilitar",
          pl: "w\u0142\u0105czy\u0107/wy\u0142\u0105czy\u0107",
          uk: "\u0443\u0432\u0456\u043C\u043A\u043D\u0443\u0442\u0438/\u0432\u0438\u043C\u043A\u043D\u0443\u0442\u0438",
          "zh-cn": "\u542F\u7528/\u7981\u7528"
        },
        read: true,
        write: true,
        type: "boolean",
        role: "switch",
        def: false,
        desc: "Enables/disables automatic switching for this schedule"
      },
      native: {}
    });
  }
  async onScheduleChange(id, scheduleString) {
    var _a;
    this.log.debug("onScheduleChange: " + scheduleString + " " + id);
    if (this.scheduleIdToSchedule.get(id)) {
      this.log.debug("schedule found: " + this.scheduleIdToSchedule.get(id));
    }
    try {
      const schedule = (await this.createNewOnOffScheduleSerializer(id)).deserialize(scheduleString);
      const enabledState = await this.getStateAsync(this.getEnabledIdFromScheduleId(id));
      if (enabledState) {
        (_a = this.scheduleIdToSchedule.get(id)) == null ? void 0 : _a.destroy();
        schedule.setEnabled(enabledState.val);
        this.scheduleIdToSchedule.set(id, schedule);
      } else {
        this.log.error(`Could not retrieve state enabled state for ${id}`);
      }
    } catch (e) {
      this.logError(e);
    }
  }
  async getCoordinate() {
    if (this.coordinate) {
      return Promise.resolve(this.coordinate);
    } else {
      return new Promise((resolve, _) => {
        this.getForeignObject("system.config", (error, obj) => {
          if (obj && obj.common) {
            const lat = obj.common.latitude;
            const long = obj.common.longitude;
            if (lat && long) {
              this.log.debug(`Got coordinates lat=${lat} long=${long}`);
              resolve(new import_Coordinate.Coordinate(lat, long, this));
              return;
            }
          }
          this.log.error(
            "Could not read coordinates from system.config, using Berlins coordinates as fallback"
          );
          resolve(new import_Coordinate.Coordinate(52, 13, this));
        });
      });
    }
  }
  logError(error) {
    this.log.error(error.stack || `${error.name}: ${error.message}`);
  }
  async createNewOnOffScheduleSerializer(dataId) {
    const actionSerializer = new import_UniversalSerializer.UniversalSerializer(
      [new import_OnOffStateActionSerializer.OnOffStateActionSerializer(this.stateService)],
      this.loggingService
    );
    actionSerializer.useSerializer(
      new import_ConditionActionSerializer.ConditionActionSerializer(
        new import_UniversalSerializer.UniversalSerializer(
          [
            new import_StringStateAndConstantConditionSerializer.StringStateAndConstantConditionSerializer(this.stateService),
            new import_StringStateAndStateConditionSerializer.StringStateAndStateConditionSerializer(this.stateService)
          ],
          this.loggingService
        ),
        actionSerializer,
        this
      )
    );
    const triggerSerializer = new import_UniversalSerializer.UniversalSerializer(
      [
        new import_TimeTriggerSerializer.TimeTriggerSerializer(actionSerializer),
        new import_AstroTriggerSerializer.AstroTriggerSerializer(actionSerializer),
        new import_OneTimeTriggerSerializer.OneTimeTriggerSerializer(actionSerializer, (triggerId) => {
          var _a;
          (_a = this.messageService) == null ? void 0 : _a.handleMessage({
            message: {
              dataId,
              triggerId
            },
            command: "delete-trigger",
            from: "schedule-switcher.0"
          });
        })
      ],
      this.loggingService
    );
    return new import_OnOffScheduleSerializer.OnOffScheduleSerializer(
      new import_UniversalTriggerScheduler.UniversalTriggerScheduler([
        new import_TimeTriggerScheduler.TimeTriggerScheduler(this.stateService, import_node_schedule.scheduleJob, import_node_schedule.cancelJob, this.loggingService),
        new import_AstroTriggerScheduler.AstroTriggerScheduler(
          new import_TimeTriggerScheduler.TimeTriggerScheduler(this.stateService, import_node_schedule.scheduleJob, import_node_schedule.cancelJob, this.loggingService),
          import_suncalc.getTimes,
          await this.getCoordinate(),
          this.loggingService
        ),
        new import_OneTimeTriggerScheduler.OneTimeTriggerScheduler(import_node_schedule.scheduleJob, import_node_schedule.cancelJob, this.loggingService, this)
      ]),
      actionSerializer,
      triggerSerializer,
      this
    );
  }
  /**
   * Is called when vis-2 receives a message.
   */
  async setSendTo(data) {
    const send = JSON.parse(data);
    this.log.debug(JSON.stringify(send));
    try {
      if (this.messageService) {
        await this.messageService.handleMessage(send);
      } else {
        this.log.error("Message service not initialized");
      }
    } catch (e) {
      this.logError(e);
      this.log.error(`Could not handle message:`);
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new ScheduleSwitcher(options);
} else {
  (() => new ScheduleSwitcher())();
}
//# sourceMappingURL=main.js.map
