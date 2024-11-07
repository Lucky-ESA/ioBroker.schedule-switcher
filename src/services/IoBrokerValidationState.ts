import * as fs from "fs";
import { getTimes } from "suncalc";
import { validationState } from "./ValidationState";

export class IoBrokerValidationState implements validationState {
    private adapter: ioBroker.Adapter;
    private delayTimeout: any;
    constructor(adapter: ioBroker.Adapter) {
        this.adapter = adapter;
    }

    async validation(id: string, val: any, check: boolean): Promise<any> {
        if ((val.type && val.type == "OnOffSchedule") || check) {
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
                        if (trigger.hour == undefined || trigger.hour < 0 || trigger.hour > 23) {
                            this.adapter.log.warn(`Hour must be in range 0-23 - in ${id}`);
                            trigger.hour = 0;
                        }
                        if (trigger.minute == undefined || trigger.minute < 0 || trigger.minute > 59) {
                            this.adapter.log.warn(`Minute must be in range 0-59 - in ${id}`);
                            trigger.minute = 0;
                        }
                        if (
                            typeof trigger.weekdays !== "object" ||
                            trigger.weekdays.length === 0 ||
                            trigger.weekdays.length > 7
                        ) {
                            this.adapter.log.error(`Empty weekday is not allowed in ${id}`);
                            trigger.weekdays = [0];
                        }
                    } else if (trigger.type === "AstroTrigger") {
                        if (
                            trigger.astroTime == null ||
                            (trigger.astroTime !== "sunrise" &&
                                trigger.astroTime !== "sunset" &&
                                trigger.astroTime !== "solarNoon")
                        ) {
                            this.adapter.log.warn(`Astro time may not be null - in ${id}`);
                            trigger.trigger.astroTime = "sunrise";
                        }
                        if (
                            trigger.shiftInMinutes == null ||
                            trigger.shiftInMinutes > 120 ||
                            trigger.shiftInMinutes < -120
                        ) {
                            this.adapter.log.warn(`Shift in minutes must be in range -120 to 120 - in ${id}`);
                            trigger.shiftInMinutes = 0;
                        }
                    } else if (trigger.type === "OneTimeTrigger") {
                        if (isNaN(new Date(trigger.date).getTime())) {
                            this.adapter.log.warn(`Wrong OneTimeDate ${trigger.date} in ${id}`);
                            trigger.date = new Date().toISOString();
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
                                    `Missing action condition ${JSON.stringify(trigger.action)} in ${id}`,
                                );
                                return;
                            }
                            if (trigger.action.condition.type !== "StringStateAndConstantCondition") {
                                if (trigger.action.condition.constant !== "true") {
                                    trigger.action.condition.constant = "true";
                                    this.adapter.log.warn(
                                        `Wrong condition constant ${JSON.stringify(trigger.action)} in ${id}`,
                                    );
                                }
                                if (!trigger.action.condition.stateId1 || !trigger.action.condition.stateId2) {
                                    val = {};
                                    this.adapter.log.warn(
                                        `Missing action condition states1 or states2 ${JSON.stringify(trigger.action)} in ${id}`,
                                    );
                                    return;
                                }
                                const stateId1 = await this.adapter.getForeignObjectAsync(
                                    trigger.action.condition.stateId1,
                                );
                                if (!stateId1) {
                                    val = {};
                                    this.adapter.log.warn(
                                        `Wrong action condition states1 ${JSON.stringify(trigger.action)} in ${id}`,
                                    );
                                    return;
                                }
                                const stateId2 = await this.adapter.getForeignObjectAsync(
                                    trigger.action.condition.stateId2,
                                );
                                if (!stateId2) {
                                    val = {};
                                    this.adapter.log.warn(
                                        `Wrong action condition states2 ${JSON.stringify(trigger.action)} in ${id}`,
                                    );
                                    return;
                                }
                            } else if (trigger.action.condition.type !== "StringStateAndStateCondition") {
                                if (!trigger.action.condition.stateId) {
                                    val = {};
                                    this.adapter.log.warn(
                                        `Missing action condition states ${JSON.stringify(trigger.action)} in ${id}`,
                                    );
                                    return;
                                }
                                const stateId = await this.adapter.getForeignObjectAsync(
                                    trigger.action.condition.stateId,
                                );
                                if (!stateId) {
                                    val = {};
                                    this.adapter.log.warn(
                                        `Wrong action condition states ${JSON.stringify(trigger.action)} in ${id}`,
                                    );
                                    return;
                                }
                            } else {
                                val = {};
                                this.adapter.log.warn(
                                    `Wrong action condition string ${JSON.stringify(trigger.action)} in ${id}`,
                                );
                                return;
                            }
                            if (trigger.action.condition.sign !== "==" && trigger.action.condition.sign !== "!=") {
                                trigger.action.condition.sign = "==";
                                this.adapter.log.warn(
                                    `Wrong condition sign ${JSON.stringify(trigger.action)} in ${id}`,
                                );
                            }
                            if (!trigger.action.action) {
                                trigger.action.action = {};
                                this.adapter.log.warn(
                                    `Wrong action condition ${JSON.stringify(trigger.action)} in ${id}`,
                                );
                            }
                            if (trigger.action.action.type !== "OnOffStateAction") {
                                trigger.action.action.type = "OnOffStateAction";
                                this.adapter.log.warn(
                                    `Wrong action type ${JSON.stringify(trigger.action.action)} in ${id}`,
                                );
                            }
                            if (trigger.action.action.name !== "Off" && trigger.action.action.name !== "On") {
                                trigger.action.action.name = "Off";
                                this.adapter.log.warn(
                                    `Wrong action name ${JSON.stringify(trigger.action)} in ${id} - set Off`,
                                );
                            }
                        } else {
                            trigger.action.type = "OnOffStateAction";
                            this.adapter.log.warn(`Wrong action type ${JSON.stringify(trigger.action)} in ${id}`);
                            if (trigger.action.name !== "Off" && trigger.action.name !== "On") {
                                trigger.action.name = "Off";
                                this.adapter.log.warn(
                                    `Wrong action name ${JSON.stringify(trigger.action)} in ${id} - set Off`,
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

    async validationView(utils: string): Promise<void> {
        this.adapter.log.info("Start Widget control!");
        const visFolder = [];
        const allVisViews: any = {};
        const newViews: any = {};
        const allVIS = await this.adapter.getObjectViewAsync("system", "instance", {
            startkey: "system.adapter.vis.",
            endkey: "system.adapter.vis.\u9999",
        });
        const allVIS2 = await this.adapter.getObjectViewAsync("system", "instance", {
            startkey: "system.adapter.vis-2.",
            endkey: "system.adapter.vis-2.\u9999",
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
            const path = `${utils}files/`;
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
                                    if (
                                        templates[template].widgets &&
                                        JSON.stringify(templates[template].widgets).indexOf(
                                            "tplSchedule-switcherDevicePlan",
                                        ) !== -1
                                    ) {
                                        allVisViews[vis][folder][template] = [];
                                        for (const widget in templates[template].widgets) {
                                            if (
                                                templates[template].widgets[widget].tpl ===
                                                "tplSchedule-switcherDevicePlan"
                                            ) {
                                                if (
                                                    templates[template].widgets[widget].data["oid-dataId"] != "" &&
                                                    !newViews[templates[template].widgets[widget].data["oid-dataId"]]
                                                ) {
                                                    newViews[templates[template].widgets[widget].data["oid-dataId"]] =
                                                        {};
                                                    newViews[templates[template].widgets[widget].data["oid-dataId"]][
                                                        vis
                                                    ] = {};
                                                    newViews[templates[template].widgets[widget].data["oid-dataId"]][
                                                        vis
                                                    ][folder] = {};
                                                    const countCondition: number = Number.parseInt(
                                                        templates[template].widgets[widget].data[
                                                            "conditionStatesCount"
                                                        ],
                                                        10,
                                                    );
                                                    const idsCondition: any = [];
                                                    for (let i = 1; i <= countCondition; i++) {
                                                        const id: string =
                                                            templates[template].widgets[widget].data[
                                                                `oid-conditionStateId${i}`
                                                            ];
                                                        if (id !== undefined && id !== "") {
                                                            const json: any = {};
                                                            json[`oid-conditionStateId${i}`] =
                                                                templates[template].widgets[widget].data[
                                                                    `oid-conditionStateId${i}`
                                                                ];
                                                            idsCondition.push(json);
                                                        }
                                                    }
                                                    const countState: number = Number.parseInt(
                                                        templates[template].widgets[widget].data[
                                                            "conditionStatesCount"
                                                        ],
                                                        10,
                                                    );
                                                    const idsState: any = [];
                                                    for (let i = 1; i <= countState; i++) {
                                                        const id: string =
                                                            templates[template].widgets[widget].data[`oid-stateId${i}`];
                                                        if (id !== undefined && id !== "") {
                                                            const json: any = {};
                                                            json[`oid-stateId${i}`] =
                                                                templates[template].widgets[widget].data[
                                                                    `oid-stateId${i}`
                                                                ];
                                                            idsState.push(json);
                                                        }
                                                    }
                                                    const oid_enabled: string = templates[template].widgets[widget]
                                                        .data["oid-enabled"]
                                                        ? templates[template].widgets[widget].data["oid-enabled"]
                                                        : "not select";
                                                    newViews[templates[template].widgets[widget].data["oid-dataId"]][
                                                        vis
                                                    ][folder][widget] = {
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
                                                    };
                                                } else if (
                                                    templates[template].widgets[widget].data["oid-dataId"] != ""
                                                ) {
                                                    if (
                                                        !newViews[
                                                            templates[template].widgets[widget].data["oid-dataId"]
                                                        ][vis]
                                                    )
                                                        newViews[
                                                            templates[template].widgets[widget].data["oid-dataId"]
                                                        ][vis] = {};
                                                    if (
                                                        !newViews[
                                                            templates[template].widgets[widget].data["oid-dataId"]
                                                        ][vis][folder]
                                                    )
                                                        newViews[
                                                            templates[template].widgets[widget].data["oid-dataId"]
                                                        ][vis][folder] = {};
                                                    const countCondition: number = Number.parseInt(
                                                        templates[template].widgets[widget].data[
                                                            "conditionStatesCount"
                                                        ],
                                                        10,
                                                    );
                                                    const idsCondition: any = [];
                                                    for (let i = 1; i <= countCondition; i++) {
                                                        const id: string =
                                                            templates[template].widgets[widget].data[
                                                                `oid-conditionStateId${i}`
                                                            ];
                                                        if (id !== undefined && id !== "") {
                                                            const json: any = {};
                                                            json[`oid-conditionStateId${i}`] =
                                                                templates[template].widgets[widget].data[
                                                                    `oid-conditionStateId${i}`
                                                                ];
                                                            idsCondition.push(json);
                                                        }
                                                    }
                                                    const countState: number = Number.parseInt(
                                                        templates[template].widgets[widget].data[
                                                            "conditionStatesCount"
                                                        ],
                                                        10,
                                                    );
                                                    const idsState: any = [];
                                                    for (let i = 1; i <= countState; i++) {
                                                        const id: string =
                                                            templates[template].widgets[widget].data[`oid-stateId${i}`];
                                                        if (id !== undefined && id !== "") {
                                                            const json: any = {};
                                                            json[`oid-stateId${i}`] =
                                                                templates[template].widgets[widget].data[
                                                                    `oid-stateId${i}`
                                                                ];
                                                            idsState.push(json);
                                                        }
                                                    }
                                                    const oid_enabled: string = templates[template].widgets[widget]
                                                        .data["oid-enabled"]
                                                        ? templates[template].widgets[widget].data["oid-enabled"]
                                                        : "not select";
                                                    newViews[templates[template].widgets[widget].data["oid-dataId"]][
                                                        vis
                                                    ][folder][widget] = {
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
                                                    };
                                                }
                                                if (
                                                    !templates[template].widgets[widget].data["oid-dataId"] ||
                                                    templates[template].widgets[widget].data["oid-dataId"] == ""
                                                ) {
                                                    this.adapter.log.warn(
                                                        `Missing dataId for ${widget} - ${template} - ${folder} - ${vis}`,
                                                    );
                                                }
                                                if (
                                                    !templates[template].widgets[widget].data["oid-stateId1"] ||
                                                    templates[template].widgets[widget].data["oid-stateId1"] == ""
                                                ) {
                                                    this.adapter.log.warn(
                                                        `Missing stateId for ${widget} - ${template} - ${folder} - ${vis}`,
                                                    );
                                                }
                                                if (
                                                    !templates[template].widgets[widget].data["oid-enabled"] ||
                                                    templates[template].widgets[widget].data["oid-enabled"] == ""
                                                ) {
                                                    this.adapter.log.warn(
                                                        `Missing oid-enabledId for ${widget} - ${template} - ${folder} - ${vis}`,
                                                    );
                                                }
                                                if (
                                                    templates[template].widgets[widget].data["oid-dataId"] &&
                                                    templates[template].widgets[widget].data["oid-enabled"] &&
                                                    templates[template].widgets[widget].data["oid-dataId"] != "" &&
                                                    templates[template].widgets[widget].data["oid-enabled"] != ""
                                                ) {
                                                    const splitDataId =
                                                        templates[template].widgets[widget].data["oid-dataId"].split(
                                                            ".",
                                                        );
                                                    const splitEnabledId =
                                                        templates[template].widgets[widget].data["oid-enabled"].split(
                                                            ".",
                                                        );
                                                    if (splitDataId.length != 5 || splitDataId[4] != "data") {
                                                        this.adapter.log.warn(
                                                            `Wrong dataId ${templates[template].widgets[widget].data["oid-dataId"]} for ${widget} - ${template} - ${folder} - ${vis}`,
                                                        );
                                                    }
                                                    if (splitEnabledId.length != 5 || splitEnabledId[4] != "enabled") {
                                                        this.adapter.log.warn(
                                                            `Wrong dataId ${templates[template].widgets[widget].data["oid-enabled"]} for ${widget} - ${template} - ${folder} - ${vis}`,
                                                        );
                                                    }
                                                    if (splitEnabledId[3] != splitDataId[3]) {
                                                        this.adapter.log.warn(
                                                            `Wrong dataId and enabledID ${templates[template].widgets[widget].data["oid-dataId"]} - ${templates[template].widgets[widget].data["oid-enabled"]} for ${widget} - ${template} - ${folder} - ${vis}`,
                                                        );
                                                    }
                                                }
                                                const wid: any = {};
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
        this.adapter.log.debug("newViews: " + JSON.stringify(newViews));
        if (Object.keys(newViews).length > 0) {
            for (const stateId in newViews) {
                const id = stateId.replace("data", "views");
                await this.adapter.setState(id, JSON.stringify(newViews[stateId]), true);
            }
        }
        const prefix: string = `schedule-switcher.${this.adapter.instance}.`;
        const currentStates: any = await this.adapter.getStatesAsync(`${prefix}*.data`);
        for (const stateId in currentStates) {
            if (!newViews[stateId] && typeof currentStates[stateId].val === "string") {
                const id = stateId.replace("data", "enabled");
                const eneabled = await this.adapter.getStateAsync(id);
                const val = JSON.parse(currentStates[stateId].val);
                if (
                    val.onAction &&
                    val.onAction.idsOfStatesToSet &&
                    val.onAction.idsOfStatesToSet[0] === "default.state"
                ) {
                    this.adapter.log.debug("Default state!");
                }
                if (
                    val.offAction &&
                    val.offAction.idsOfStatesToSet &&
                    val.offAction.idsOfStatesToSet[0] === "default.state"
                ) {
                    this.adapter.log.debug("Default state!");
                }
                const view = stateId.replace("data", "views");
                if (
                    (val.onAction.idsOfStatesToSet.length > 0 || val.offAction.idsOfStatesToSet.length > 0) &&
                    val.triggers.length > 0
                ) {
                    await this.adapter.setState(id, false, true);
                    if (eneabled && eneabled.val) {
                        await this.adapter.setState(
                            view,
                            JSON.stringify({
                                error: `Trigger ${stateId} is active but there is no widget. Set Enabled to false!!!`,
                            }),
                            true,
                        );
                        this.adapter.log.error(
                            `Trigger ${stateId} is active but there is no widget. Set Enabled to false!!!`,
                        );
                    } else {
                        await this.adapter.setState(
                            view,
                            JSON.stringify({
                                error: `Trigger ${stateId} is active but there is no widget.`,
                            }),
                            true,
                        );
                    }
                } else {
                    await this.adapter.setState(
                        view,
                        JSON.stringify({
                            error: `The trigger ${stateId} is not used.`,
                        }),
                        true,
                    );
                }
            }
        }
    }

    public async setNextTime(coordinate: any): Promise<void> {
        const states = await this.adapter.getStatesAsync(`schedule-switcher.${this.adapter.instance}.*.data`);
        for (const id in states) {
            const state = states[id];
            if (state) {
                if (typeof state.val === "string" && state.val.startsWith("{")) {
                    const triggers = JSON.parse(state.val);
                    if (triggers && triggers.triggers && triggers.triggers.length > 0) {
                        for (const trigger of triggers.triggers) {
                            if (trigger && trigger.type === "AstroTrigger") {
                                trigger.todayTrigger = await this.nextDate(trigger, coordinate);
                                await this.adapter.setState(id, JSON.stringify(triggers), true);
                            }
                        }
                    }
                }
            }
        }
    }

    private async nextDate(data: any, coordinate: any): Promise<any> {
        const next = getTimes(new Date(), coordinate.getLatitude(), coordinate.getLongitude());
        let astro: Date;
        if (data.astroTime === "sunset") {
            astro = next.sunset;
        } else if (data.astroTime === "sunrise") {
            astro = next.sunrise;
        } else {
            astro = next.solarNoon;
        }
        new Date(astro.getTime()).setMinutes(new Date(astro.getTime()).getMinutes() + data.shiftInMinutes);
        return { hour: astro.getHours(), minute: astro.getMinutes(), weekday: astro.getDay(), date: astro };
    }

    private async nextActiveDay(array: number[], day: number): Promise<number> {
        array = array.map((val) => {
            return val === 0 ? 7 : val;
        });
        const numChecker: any = (num: any) => array.find((v) => v > num);
        const next: number | undefined = numChecker(day);
        return next == undefined ? 0 : next;
    }
}
