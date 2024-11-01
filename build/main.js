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
var import_IoBrokerValidationState = require("./services/IoBrokerValidationState");
var import_MessageService = require("./services/MessageService");
class ScheduleSwitcher extends utils.Adapter {
  scheduleIdToSchedule = /* @__PURE__ */ new Map();
  loggingService = new import_IoBrokerLoggingService.IoBrokerLoggingService(this);
  stateService = new import_IoBrokerStateService.IoBrokerStateService(this);
  coordinate;
  messageService;
  widgetControl;
  validation = new import_IoBrokerValidationState.IoBrokerValidationState(this);
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
    await this.validation.validationView(utils.getAbsoluteDefaultDataDir());
    const record = await this.getStatesAsync(`schedule-switcher.${this.instance}.*.data`);
    for (const id in record) {
      const state = record[id];
      this.log.debug(`got state: ${state ? JSON.stringify(state) : "null"} with id: ${id}`);
      if (state) {
        this.log.info("ID: " + id);
        if (typeof state.val === "string" && state.val.startsWith("{")) {
          const stateVal = JSON.parse(state.val);
          await this.validation.validation(id, stateVal, false);
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
        this.validation.validationView(utils.getAbsoluteDefaultDataDir());
      },
      24 * 60 * 1e3 * 60
    );
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
      await this.getCoordinate(),
      this.validation
    );
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
      this,
      this.loggingService
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
