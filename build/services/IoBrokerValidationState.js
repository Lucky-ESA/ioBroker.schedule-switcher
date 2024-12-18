"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var IoBrokerValidationState_exports = {};
__export(IoBrokerValidationState_exports, {
  IoBrokerValidationState: () => IoBrokerValidationState
});
module.exports = __toCommonJS(IoBrokerValidationState_exports);
var fs = __toESM(require("node:fs"));
var import_suncalc = require("suncalc");
class IoBrokerValidationState {
  adapter;
  /**
   * @param adapter iobroker
   */
  constructor(adapter) {
    this.adapter = adapter;
  }
  /**
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
            val = {};
            return;
          }
        } else {
          this.adapter.log.error(`Cannot found onAction in ${id}`);
          val = {};
          return;
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
            val = {};
            return;
          }
        } else {
          this.adapter.log.error(`Cannot found offAction in ${id}`);
          val = {};
          return;
        }
      }
      if (val.triggers && typeof val.triggers === "object" && val.triggers.length > 0) {
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
            if (typeof trigger.weekdays !== "object" || trigger.weekdays.length === 0 || trigger.weekdays.length > 7) {
              this.adapter.log.error(`Empty weekday is not allowed in ${id}`);
              trigger.weekdays = [0];
            }
            if (trigger.todayTrigger == void 0) {
              trigger.todayTrigger = {};
            }
          } else if (trigger.type === "AstroTrigger") {
            if (trigger.astroTime == null || trigger.astroTime !== "sunrise" && trigger.astroTime !== "sunset" && trigger.astroTime !== "solarNoon") {
              this.adapter.log.warn(`Astro time may not be null - in ${id}`);
              trigger.trigger.astroTime = "sunrise";
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
            val = {};
            return;
          }
          const objId = id.split(".");
          if (trigger.objectId.toString() != objId[3]) {
            this.adapter.log.warn(`Wrong ObjectId ${trigger.objectId} in ${id}`);
            trigger.objectId = parseInt(objId[3]);
          }
          if (!trigger.action) {
            trigger.action = {};
            this.adapter.log.warn(`Wrong action ${JSON.stringify(trigger)} in ${id}`);
          }
          if (trigger.action.type !== "OnOffStateAction") {
            if (trigger.action.type === "ConditionAction") {
              if (!trigger.action.condition) {
                val = {};
                this.adapter.log.warn(
                  `Missing action condition ${JSON.stringify(trigger.action)} in ${id}`
                );
                return;
              }
              if (trigger.action.condition.type !== "StringStateAndConstantCondition") {
                if (trigger.action.condition.constant !== "true") {
                  trigger.action.condition.constant = "true";
                  this.adapter.log.warn(
                    `Wrong condition constant ${JSON.stringify(trigger.action)} in ${id}`
                  );
                }
                if (!trigger.action.condition.stateId1 || !trigger.action.condition.stateId2) {
                  val = {};
                  this.adapter.log.warn(
                    `Missing action condition states1 or states2 ${JSON.stringify(trigger.action)} in ${id}`
                  );
                  return;
                }
                const stateId1 = await this.adapter.getForeignObjectAsync(
                  trigger.action.condition.stateId1
                );
                if (!stateId1) {
                  val = {};
                  this.adapter.log.warn(
                    `Wrong action condition states1 ${JSON.stringify(trigger.action)} in ${id}`
                  );
                  return;
                }
                const stateId2 = await this.adapter.getForeignObjectAsync(
                  trigger.action.condition.stateId2
                );
                if (!stateId2) {
                  val = {};
                  this.adapter.log.warn(
                    `Wrong action condition states2 ${JSON.stringify(trigger.action)} in ${id}`
                  );
                  return;
                }
              } else if (trigger.action.condition.type !== "StringStateAndStateCondition") {
                if (!trigger.action.condition.stateId) {
                  val = {};
                  this.adapter.log.warn(
                    `Missing action condition states ${JSON.stringify(trigger.action)} in ${id}`
                  );
                  return;
                }
                const stateId = await this.adapter.getForeignObjectAsync(
                  trigger.action.condition.stateId
                );
                if (!stateId) {
                  val = {};
                  this.adapter.log.warn(
                    `Wrong action condition states ${JSON.stringify(trigger.action)} in ${id}`
                  );
                  return;
                }
              } else {
                val = {};
                this.adapter.log.warn(
                  `Wrong action condition string ${JSON.stringify(trigger.action)} in ${id}`
                );
                return;
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
      } else {
        this.adapter.log.debug(`Cannot found triggers in ${id}`);
        val.triggers = [];
      }
    } else {
      this.adapter.log.error(`Cannot found OnOffSchedule in ${id}`);
      val = {};
      return;
    }
  }
  /**
   * @param utils Utils
   */
  async validationView(utils) {
    this.adapter.log.info("Start Widget control!");
    this.adapter.log.debug(`Path: ${utils}`);
    const visFolder = [];
    const allVisViews = {};
    const newViews = {};
    const allVIS = await this.adapter.getObjectViewAsync("system", "instance", {
      startkey: "system.adapter.vis.",
      endkey: "system.adapter.vis.\u9999"
    });
    const allVIS2 = await this.adapter.getObjectViewAsync("system", "instance", {
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
    this.adapter.log.debug(`Folder: ${JSON.stringify(visFolder)}`);
    if (visFolder.length > 0) {
      const path = `${utils}files/`;
      for (const vis of visFolder) {
        allVisViews[vis] = {};
        if (fs.existsSync(`${path}${vis}/`)) {
          const folders = fs.readdirSync(`${path}${vis}/`);
          this.adapter.log.debug(`Folders: ${JSON.stringify(folders)}`);
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
                            const countCondition = Number.parseInt(
                              templates[template].widgets[widget].data.conditionStatesCount,
                              10
                            );
                            const idsCondition = [];
                            for (let i = 1; i <= countCondition; i++) {
                              const id = templates[template].widgets[widget].data[`oid-conditionStateId${i}`];
                              if (id !== void 0 && id !== "") {
                                const json = {};
                                json[`oid-conditionStateId${i}`] = templates[template].widgets[widget].data[`oid-conditionStateId${i}`];
                                idsCondition.push(json);
                              }
                            }
                            const countState = Number.parseInt(
                              templates[template].widgets[widget].data.conditionStatesCount,
                              10
                            );
                            const idsState = [];
                            for (let i = 1; i <= countState; i++) {
                              const id = templates[template].widgets[widget].data[`oid-stateId${i}`];
                              if (id !== void 0 && id !== "") {
                                const json = {};
                                json[`oid-stateId${i}`] = templates[template].widgets[widget].data[`oid-stateId${i}`];
                                idsState.push(json);
                              }
                            }
                            const oid_enabled = templates[template].widgets[widget].data["oid-enabled"] ? templates[template].widgets[widget].data["oid-enabled"] : "not select";
                            newViews[templates[template].widgets[widget].data["oid-dataId"]][vis][folder][widget] = {
                              prefix: folder,
                              namespace: vis,
                              view: template,
                              widgetId: widget,
                              newId: templates[template].widgets[widget].data["oid-dataId"],
                              enabled: oid_enabled,
                              stateCount: countState,
                              state: idsState,
                              conditionCount: countCondition,
                              condition: idsCondition
                            };
                          } else if (templates[template].widgets[widget].data["oid-dataId"] != "") {
                            if (!newViews[templates[template].widgets[widget].data["oid-dataId"]][vis]) {
                              newViews[templates[template].widgets[widget].data["oid-dataId"]][vis] = {};
                            }
                            if (!newViews[templates[template].widgets[widget].data["oid-dataId"]][vis][folder]) {
                              newViews[templates[template].widgets[widget].data["oid-dataId"]][vis][folder] = {};
                            }
                            const countCondition = Number.parseInt(
                              templates[template].widgets[widget].data.conditionStatesCount,
                              10
                            );
                            const idsCondition = [];
                            for (let i = 1; i <= countCondition; i++) {
                              const id = templates[template].widgets[widget].data[`oid-conditionStateId${i}`];
                              if (id !== void 0 && id !== "") {
                                const json = {};
                                json[`oid-conditionStateId${i}`] = templates[template].widgets[widget].data[`oid-conditionStateId${i}`];
                                idsCondition.push(json);
                              }
                            }
                            const countState = Number.parseInt(
                              templates[template].widgets[widget].data.conditionStatesCount,
                              10
                            );
                            const idsState = [];
                            for (let i = 1; i <= countState; i++) {
                              const id = templates[template].widgets[widget].data[`oid-stateId${i}`];
                              if (id !== void 0 && id !== "") {
                                const json = {};
                                json[`oid-stateId${i}`] = templates[template].widgets[widget].data[`oid-stateId${i}`];
                                idsState.push(json);
                              }
                            }
                            const oid_enabled = templates[template].widgets[widget].data["oid-enabled"] ? templates[template].widgets[widget].data["oid-enabled"] : "not select";
                            newViews[templates[template].widgets[widget].data["oid-dataId"]][vis][folder][widget] = {
                              prefix: folder,
                              namespace: vis,
                              view: template,
                              widgetId: widget,
                              newId: templates[template].widgets[widget].data["oid-dataId"],
                              enabled: oid_enabled,
                              stateCount: countState,
                              state: idsState,
                              conditionCount: countCondition,
                              condition: idsCondition
                            };
                          }
                          if (!templates[template].widgets[widget].data["oid-dataId"] || templates[template].widgets[widget].data["oid-dataId"] == "") {
                            this.adapter.log.warn(
                              `Missing dataId for ${widget} - ${template} - ${folder} - ${vis}`
                            );
                          }
                          if (!templates[template].widgets[widget].data["oid-stateId1"] || templates[template].widgets[widget].data["oid-stateId1"] == "") {
                            this.adapter.log.warn(
                              `Missing stateId for ${widget} - ${template} - ${folder} - ${vis}`
                            );
                          }
                          if (!templates[template].widgets[widget].data["oid-enabled"] || templates[template].widgets[widget].data["oid-enabled"] == "") {
                            this.adapter.log.warn(
                              `Missing oid-enabledId for ${widget} - ${template} - ${folder} - ${vis}`
                            );
                          }
                          if (templates[template].widgets[widget].data["oid-dataId"] && templates[template].widgets[widget].data["oid-enabled"] && templates[template].widgets[widget].data["oid-dataId"] != "" && templates[template].widgets[widget].data["oid-enabled"] != "") {
                            const splitDataId = templates[template].widgets[widget].data["oid-dataId"].split(".");
                            const splitEnabledId = templates[template].widgets[widget].data["oid-enabled"].split(".");
                            if (splitDataId.length != 5 || splitDataId[4] != "data") {
                              this.adapter.log.warn(
                                `Wrong dataId ${templates[template].widgets[widget].data["oid-dataId"]} for ${widget} - ${template} - ${folder} - ${vis}`
                              );
                            }
                            if (splitEnabledId.length != 5 || splitEnabledId[4] != "enabled") {
                              this.adapter.log.warn(
                                `Wrong dataId ${templates[template].widgets[widget].data["oid-enabled"]} for ${widget} - ${template} - ${folder} - ${vis}`
                              );
                            }
                            if (splitEnabledId[3] != splitDataId[3]) {
                              this.adapter.log.warn(
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
        } else {
          this.adapter.log.debug(`Cannot found ${path}${vis}/`);
        }
      }
    }
    this.adapter.log.debug(`newViews: ${JSON.stringify(newViews)}`);
    if (Object.keys(newViews).length > 0) {
      for (const stateId in newViews) {
        const id = stateId.replace("data", "views");
        const obj = await this.adapter.getObjectAsync(id);
        if (obj) {
          await this.adapter.setState(id, {
            val: JSON.stringify(newViews[stateId]),
            ack: true
          });
        } else {
          this.adapter.log.error(
            `Missing object ${id} - Please delete Widgets: ${JSON.stringify(newViews[stateId])}`
          );
        }
      }
    }
    const prefix = `schedule-switcher.${this.adapter.instance}.`;
    const currentStates = await this.adapter.getStatesAsync(`${prefix}*.data`);
    for (const stateId in currentStates) {
      if (!newViews[stateId] && typeof currentStates[stateId].val === "string") {
        const id = stateId.replace("data", "enabled");
        const eneabled = await this.adapter.getStateAsync(id);
        const val = JSON.parse(currentStates[stateId].val);
        if (val.onAction && val.onAction.idsOfStatesToSet && val.onAction.idsOfStatesToSet[0] === "default.state") {
          this.adapter.log.debug("Default state!");
        }
        if (val.offAction && val.offAction.idsOfStatesToSet && val.offAction.idsOfStatesToSet[0] === "default.state") {
          this.adapter.log.debug("Default state!");
        }
        const view = stateId.replace("data", "views");
        if ((val.onAction.idsOfStatesToSet.length > 0 || val.offAction.idsOfStatesToSet.length > 0) && val.triggers.length > 0) {
          if (eneabled && eneabled.val) {
            await this.adapter.setState(view, {
              val: JSON.stringify({
                error: `Trigger ${stateId} is active but there is no widget. Set Enabled to false!!!`
              }),
              ack: true
            });
            this.adapter.log.warn(
              `Trigger ${stateId} is active but there is no widget. Set Enabled to false!!!`
            );
          } else {
            await this.adapter.setState(view, {
              val: JSON.stringify({
                error: `Trigger ${stateId} is active but there is no widget.`
              }),
              ack: true
            });
          }
        } else {
          await this.adapter.setState(view, {
            val: JSON.stringify({
              error: `The trigger ${stateId} is not used.`
            }),
            ack: true
          });
        }
      }
    }
  }
  /**
   * @param coordinate Coordinates
   */
  async setNextTime(coordinate) {
    const states = await this.adapter.getStatesAsync(`schedule-switcher.${this.adapter.instance}.*.data`);
    for (const id in states) {
      const state = states[id];
      if (state) {
        if (typeof state.val === "string" && state.val.startsWith("{")) {
          const triggers = JSON.parse(state.val);
          if (triggers && triggers.triggers && triggers.triggers.length > 0) {
            let isChange = false;
            for (const trigger of triggers.triggers) {
              if (trigger && trigger.type === "AstroTrigger") {
                trigger.todayTrigger.date = await this.nextDate(/* @__PURE__ */ new Date(), trigger, coordinate);
                trigger.todayTrigger.date = await this.nextDateSwitch(/* @__PURE__ */ new Date(), trigger);
                const actual = new Date(trigger.todayTrigger.date);
                trigger.todayTrigger.hour = actual.getHours();
                trigger.todayTrigger.minute = actual.getMinutes();
                trigger.todayTrigger.weekday = actual.getDay();
                isChange = true;
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
   * @param coordinate Coordinates
   */
  async setActionTime(coordinate) {
    const states = await this.adapter.getStatesAsync(`schedule-switcher.${this.adapter.instance}.*.data`);
    const allData = [];
    for (const id in states) {
      const state = states[id];
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
                  trigger.todayTrigger = await this.nextDate(/* @__PURE__ */ new Date(), trigger, coordinate);
                  switching.hour = trigger.todayTrigger.hour;
                  switching.minute = trigger.todayTrigger.minute;
                  switching.day = now.getDate();
                  switching.dateISO = trigger.date;
                  switching.timestamp = new Date(trigger.date).getTime();
                } else {
                  const t = await this.nextDateSwitch(/* @__PURE__ */ new Date(), trigger);
                  trigger.todayTrigger = await this.nextDate(new Date(t), trigger, coordinate);
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
  async nextDateSwitch(now, trigger) {
    let diffDays = 0;
    const nextDay = trigger.weekdays.length === 1 ? trigger.weekdays[0] : await this.nextActiveDay(trigger.weekdays, now.getDay());
    if (nextDay > now.getDay()) {
      diffDays = nextDay - now.getDay();
    } else {
      diffDays = nextDay + 7 - now.getDay();
    }
    const next = new Date(now.setDate(now.getDate() + diffDays));
    const hour = trigger.hour != null ? trigger.hour : trigger.todayTrigger.hour;
    const minute = trigger.minute != null ? trigger.minute : trigger.todayTrigger.minute;
    return (/* @__PURE__ */ new Date(
      `${next.getFullYear()}-${next.getMonth() + 1}-${next.getDate()} ${hour}:${minute}`
    )).toISOString();
  }
  nextDate(date, data, coordinate) {
    const next = (0, import_suncalc.getTimes)(date, coordinate.getLatitude(), coordinate.getLongitude());
    let astro;
    if (data.astroTime === "sunset") {
      astro = next.sunset;
    } else if (data.astroTime === "sunrise") {
      astro = next.sunrise;
    } else {
      astro = next.solarNoon;
    }
    new Date(astro.getTime()).setMinutes(new Date(astro.getTime()).getMinutes() + data.shiftInMinutes);
    return Promise.resolve({
      hour: astro.getHours(),
      minute: astro.getMinutes(),
      weekday: astro.getDay(),
      date: astro
    });
  }
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
