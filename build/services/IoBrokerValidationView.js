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
var IoBrokerValidationView_exports = {};
__export(IoBrokerValidationView_exports, {
  IoBrokerValidationView: () => IoBrokerValidationView
});
module.exports = __toCommonJS(IoBrokerValidationView_exports);
class IoBrokerValidationView {
  /**
   * @param adapter iobroker
   */
  constructor(adapter) {
    this.adapter = adapter;
    this.adapter = adapter;
  }
  /**
   * validationView
   *
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
        if (id.id.indexOf(".vis-2.") !== -1) {
          visFolder.push(id.id.replace("system.adapter.", ""));
        }
      }
    }
    if (allVIS && allVIS.rows) {
      for (const id of allVIS.rows) {
        if (id.id.indexOf(".vis.") !== -1) {
          visFolder.push(id.id.replace("system.adapter.", ""));
        }
      }
    }
    this.adapter.log.debug(`Folder: ${JSON.stringify(visFolder)}`);
    if (visFolder.length > 0) {
      for (const vis of visFolder) {
        allVisViews[vis] = {};
        let folders;
        try {
          folders = await this.adapter.readDirAsync(vis, "");
        } catch {
          this.adapter.log.warn(`Cannot read dir ${vis}`);
          continue;
        }
        this.adapter.log.debug(`Folders: ${JSON.stringify(folders)}`);
        for (const folder of folders) {
          if (folder.isDir) {
            if (await this.adapter.fileExistsAsync(vis, `${folder.file}/vis-views.json`)) {
              let valViews;
              try {
                valViews = await this.adapter.readFileAsync(vis, `${folder.file}/vis-views.json`);
              } catch {
                this.adapter.log.warn(`Cannot read file ${vis} - ${folder.file}/vis-views.json`);
                continue;
              }
              if (typeof valViews === "object" && valViews.file.indexOf("tplSchedule-switcherDevicePlan") !== -1) {
                let templates;
                if (typeof valViews.file === "string") {
                  templates = JSON.parse(valViews.file);
                } else {
                  this.adapter.log.warn(`Wrong file input in ${vis} - ${folder.file}/vis-views.json`);
                  continue;
                }
                allVisViews[vis][folder.file] = {};
                for (const template in templates) {
                  if (templates[template].widgets && JSON.stringify(templates[template].widgets).indexOf(
                    "tplSchedule-switcherDevicePlan"
                  ) !== -1) {
                    allVisViews[vis][folder.file][template] = [];
                    for (const widget in templates[template].widgets) {
                      if (templates[template].widgets[widget].tpl === "tplSchedule-switcherDevicePlan") {
                        if (templates[template].widgets[widget].data["oid-dataId"] != "" && !newViews[templates[template].widgets[widget].data["oid-dataId"]]) {
                          newViews[templates[template].widgets[widget].data["oid-dataId"]] = {};
                          newViews[templates[template].widgets[widget].data["oid-dataId"]][vis] = {};
                          newViews[templates[template].widgets[widget].data["oid-dataId"]][vis][folder.file] = {};
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
                          newViews[templates[template].widgets[widget].data["oid-dataId"]][vis][folder.file][widget] = {
                            prefix: folder,
                            namespace: vis,
                            view: template,
                            widgetId: widget,
                            newId: templates[template].widgets[widget].data["oid-dataId"],
                            enabled: oid_enabled,
                            stateCount: countState,
                            state: idsState,
                            conditionCount: countCondition,
                            condition: idsCondition,
                            valueType: templates[template].widgets[widget].data.valueType,
                            offValue: templates[template].widgets[widget].data.offValue,
                            onValue: templates[template].widgets[widget].data.onValue,
                            newOff: templates[template].widgets[widget].data.newOff,
                            newOn: templates[template].widgets[widget].data.newOn
                          };
                        } else if (templates[template].widgets[widget].data["oid-dataId"] != "") {
                          if (!newViews[templates[template].widgets[widget].data["oid-dataId"]][vis]) {
                            newViews[templates[template].widgets[widget].data["oid-dataId"]][vis] = {};
                          }
                          if (!newViews[templates[template].widgets[widget].data["oid-dataId"]][vis][folder.file]) {
                            newViews[templates[template].widgets[widget].data["oid-dataId"]][vis][folder.file] = {};
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
                          newViews[templates[template].widgets[widget].data["oid-dataId"]][vis][folder.file][widget] = {
                            prefix: folder,
                            namespace: vis,
                            view: template,
                            widgetId: widget,
                            newId: templates[template].widgets[widget].data["oid-dataId"],
                            enabled: oid_enabled,
                            stateCount: countState,
                            state: idsState,
                            conditionCount: countCondition,
                            condition: idsCondition,
                            valueType: templates[template].widgets[widget].data.valueType,
                            offValue: templates[template].widgets[widget].data.offValue,
                            onValue: templates[template].widgets[widget].data.onValue,
                            newOff: templates[template].widgets[widget].data.newOff,
                            newOn: templates[template].widgets[widget].data.newOn
                          };
                        }
                        if (!templates[template].widgets[widget].data["oid-dataId"] || templates[template].widgets[widget].data["oid-dataId"] == "") {
                          this.adapter.log.warn(
                            `Missing dataId for ${widget} - ${template} - ${JSON.stringify(folder)} - ${vis}`
                          );
                        }
                        if (!templates[template].widgets[widget].data["oid-stateId1"] || templates[template].widgets[widget].data["oid-stateId1"] == "") {
                          this.adapter.log.warn(
                            `Missing stateId for ${widget} - ${template} - ${JSON.stringify(folder)} - ${vis}`
                          );
                        }
                        if (!templates[template].widgets[widget].data["oid-enabled"] || templates[template].widgets[widget].data["oid-enabled"] == "") {
                          this.adapter.log.warn(
                            `Missing oid-enabledId for ${widget} - ${template} - ${JSON.stringify(folder)} - ${vis}`
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
                            this.adapter.log.warn(
                              `Wrong dataId ${templates[template].widgets[widget].data["oid-dataId"]} for ${widget} - ${template} - ${JSON.stringify(folder)} - ${vis}`
                            );
                          }
                          if (splitEnabledId.length != 5 || splitEnabledId[4] != "enabled") {
                            this.adapter.log.warn(
                              `Wrong dataId ${templates[template].widgets[widget].data["oid-enabled"]} for ${widget} - ${template} - ${JSON.stringify(folder)} - ${vis}`
                            );
                          }
                          if (splitEnabledId[3] != splitDataId[3]) {
                            this.adapter.log.warn(
                              `Wrong dataId and enabledID ${templates[template].widgets[widget].data["oid-dataId"]} - ${templates[template].widgets[widget].data["oid-enabled"]} for ${widget} - ${template} - ${JSON.stringify(folder)} - ${vis}`
                            );
                          }
                        }
                        const wid = {};
                        wid[widget] = templates[template].widgets[widget];
                        allVisViews[vis][folder.file][template].push(wid);
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
          if (id === "undefined") {
            this.adapter.log.error(
              `Missing dataId - Please delete Widgets: ${JSON.stringify(newViews[stateId])}`
            );
          } else {
            this.adapter.log.error(
              `Missing object ${id} - Please delete Widgets: ${JSON.stringify(newViews[stateId])}`
            );
          }
        }
      }
    }
    const currentStates = await this.adapter.getStatesAsync(
      `schedule-switcher.${this.adapter.instance}.onoff.*`
    );
    for (const stateId in currentStates) {
      if (stateId.toString().indexOf(".data") !== -1) {
        if (!newViews[stateId] && typeof currentStates[stateId].val === "string") {
          const id = stateId.replace("data", "enabled");
          const eneabled = await this.adapter.getStateAsync(id);
          const val = JSON.parse(currentStates[stateId].val);
          if (val.onAction && val.onAction.idsOfStatesToSet && val.onAction.idsOfStatesToSet[0] === "default.state") {
            this.adapter.log.debug("Default state in onAction!");
          }
          if (val.offAction && val.offAction.idsOfStatesToSet && val.offAction.idsOfStatesToSet[0] === "default.state") {
            this.adapter.log.debug("Default state in offAction!");
          }
          const view = stateId.replace("data", "views");
          if ((val.onAction.idsOfStatesToSet.length > 0 || val.offAction.idsOfStatesToSet.length > 0) && val.triggers.length > 0) {
            if (eneabled && eneabled.val && !val.active) {
              await this.adapter.setState(id, { val: false, ack: true });
              await this.adapter.setState(view, {
                val: JSON.stringify({
                  error: `Trigger ${stateId} is active but there is no widget. Set Enabled to false!!!`
                }),
                ack: true
              });
              this.adapter.log.debug(
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
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  IoBrokerValidationView
});
//# sourceMappingURL=IoBrokerValidationView.js.map
