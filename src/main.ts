/*
 * Created with @iobroker/create-adapter v2.6.5
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";
import * as fs from "fs";
import { cancelJob, scheduleJob } from "node-schedule";
import { getTimes } from "suncalc";
import { Action } from "./actions/Action";
import { Condition } from "./actions/conditions/Condition";
import { Coordinate } from "./Coordinate";
import { AstroTriggerScheduler } from "./scheduler/AstroTriggerScheduler";
import { OneTimeTriggerScheduler } from "./scheduler/OneTimeTriggerScheduler";
import { TimeTriggerScheduler } from "./scheduler/TimeTriggerScheduler";
import { UniversalTriggerScheduler } from "./scheduler/UniversalTriggerScheduler";
import { Schedule } from "./schedules/Schedule";
import { AstroTriggerSerializer } from "./serialization/AstroTriggerSerializer";
import { ConditionActionSerializer } from "./serialization/ConditionActionSerializer";
import { StringStateAndConstantConditionSerializer } from "./serialization/conditions/StringStateAndConstantConditionSerializer";
import { StringStateAndStateConditionSerializer } from "./serialization/conditions/StringStateAndStateConditionSerializer";
import { OneTimeTriggerSerializer } from "./serialization/OneTimeTriggerSerializer";
import { OnOffScheduleSerializer } from "./serialization/OnOffScheduleSerializer";
import { OnOffStateActionSerializer } from "./serialization/OnOffStateActionSerializer";
import { TimeTriggerSerializer } from "./serialization/TimeTriggerSerializer";
import { UniversalSerializer } from "./serialization/UniversalSerializer";
import { IoBrokerLoggingService } from "./services/IoBrokerLoggingService";
import { IoBrokerStateService } from "./services/IoBrokerStateService";
import { MessageService } from "./services/MessageService";
import { Trigger } from "./triggers/Trigger";

export class ScheduleSwitcher extends utils.Adapter {
    private scheduleIdToSchedule: Map<string, Schedule> = new Map<string, Schedule>();
    private loggingService = new IoBrokerLoggingService(this);
    private stateService = new IoBrokerStateService(this);
    private coordinate: Coordinate | undefined;
    private messageService: MessageService | undefined;
    private widgetControl: ioBroker.Interval | undefined | null;
    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: "schedule-switcher",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        // this.on("objectChange", this.onObjectChange.bind(this));
        this.on("message", this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this));
        this.widgetControl = null;
    }

    public static getEnabledIdFromScheduleId(scheduleId: string): string {
        return scheduleId.replace("data", "enabled");
    }

    public static getScheduleIdFromEnabledId(scheduleId: string): string {
        return scheduleId.replace("enabled", "data");
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        this.config.schedules.onOff = await this.checkConfig(this.config.schedulesData as any);
        await this.initMessageService();
        await this.fixStateStructure(this.config.schedules);
        await this.fixViewStructure();
        const record = await this.getStatesAsync(`schedule-switcher.${this.instance}.*.data`);
        for (const id in record) {
            const state = record[id];
            this.log.debug(`got state: ${state ? JSON.stringify(state) : "null"} with id: ${id}`);
            if (state) {
                this.log.info("ID: " + id);
                this.onScheduleChange(id, state.val as string);
            } else {
                this.log.error(`Could not retrieve state for ${id}`);
            }
        }
        this.subscribeStates(`*`);
        this.widgetControl = this.setInterval(
            () => {
                this.fixViewStructure();
            },
            24 * 60 * 1000 * 60,
        );
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        this.log.info("cleaning everything up...");
        this.widgetControl && this.clearInterval(this.widgetControl);
        this.messageService?.destroy();
        this.stateService.destroy();
        for (const id in this.scheduleIdToSchedule.keys()) {
            try {
                this.scheduleIdToSchedule.get(id)?.destroy();
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

    private async checkConfig(config: any | null | undefined): Promise<any> {
        if (config && config.length > 0) {
            const allIds: number[] = [];
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
            let isChange: boolean = false;
            for (const state of config) {
                let count: number = 0;
                if (state.stateId == null) {
                    const nextid: number = await this.nextId(allIds as number[], 0 as number);
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
                    native: { schedulesData: config, schedules: { onOff: allIds } },
                });
            }
            return allIds;
        }
    }

    private async nextId(ids: number[], start: number): Promise<number> {
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
    private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
        if (state) {
            if (!state.ack) {
                const command = id.split(".").pop();
                if (command === "data") {
                    this.log.debug("is schedule id start");
                    await this.onScheduleChange(id, state.val as string);
                    this.log.debug("is schedule id end");
                } else if (command === "enabled") {
                    this.log.debug("is enabled id start");
                    const dataId = ScheduleSwitcher.getScheduleIdFromEnabledId(id);
                    const scheduleData = (await this.getStateAsync(dataId))?.val;
                    await this.onScheduleChange(dataId, scheduleData as string);
                    this.log.debug("is enabled id end");
                } else if (command === "sendto" && typeof state.val === "string") {
                    this.log.debug("is sendto id");
                    this.setSendTo(state.val);
                }
                this.stateService.setState(id, state.val as string, true);
            }
        }
    }

    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    /**
     * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
     * Using this method requires "common.messagebox" property to be set to true in io-package.json
     */
    private async onMessage(obj: ioBroker.Message): Promise<void> {
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
                                obj.callback,
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
                            if (obj.message && obj.message.parameter) obj.message = obj.message.parameter;
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

    private async loadData(obj: ioBroker.Message, answer: number): Promise<void> {
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

    private async addNewTrigger(obj: ioBroker.Message): Promise<void> {
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

    private async initMessageService(): Promise<void> {
        this.messageService = new MessageService(
            this.stateService,
            this.scheduleIdToSchedule,
            this.createNewOnOffScheduleSerializer.bind(this),
            this,
            await this.getCoordinate(),
        );
    }

    private async fixViewStructure(): Promise<void> {
        this.log.info("Start Widget control!");
        const visFolder = [];
        const allVisViews: any = {};
        const newViews: any = {};
        const allVIS = await this.getObjectViewAsync("system", "instance", {
            startkey: "system.adapter.vis.",
            endkey: "system.adapter.vis.\u9999",
        });
        const allVIS2 = await this.getObjectViewAsync("system", "instance", {
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
                                                    newViews[templates[template].widgets[widget].data["oid-dataId"]][
                                                        vis
                                                    ][folder][widget] = {
                                                        prefix: folder,
                                                        namespace: vis,
                                                        view: template,
                                                        widgetId: widget,
                                                        newId: templates[template].widgets[widget].data["oid-dataId"],
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
                                                    newViews[templates[template].widgets[widget].data["oid-dataId"]][
                                                        vis
                                                    ][folder][widget] = {
                                                        prefix: folder,
                                                        namespace: vis,
                                                        view: template,
                                                        widgetId: widget,
                                                        newId: templates[template].widgets[widget].data["oid-dataId"],
                                                    };
                                                }
                                                if (
                                                    !templates[template].widgets[widget].data["oid-dataId"] ||
                                                    templates[template].widgets[widget].data["oid-dataId"] == ""
                                                ) {
                                                    this.log.warn(
                                                        `Missing dataId for ${widget} - ${template} - ${folder} - ${vis}`,
                                                    );
                                                }
                                                if (
                                                    !templates[template].widgets[widget].data["oid-stateId1"] ||
                                                    templates[template].widgets[widget].data["oid-stateId1"] == ""
                                                ) {
                                                    this.log.warn(
                                                        `Missing stateId for ${widget} - ${template} - ${folder} - ${vis}`,
                                                    );
                                                }
                                                if (
                                                    !templates[template].widgets[widget].data["oid-enabled"] ||
                                                    templates[template].widgets[widget].data["oid-enabled"] == ""
                                                ) {
                                                    this.log.warn(
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
                                                        this.log.warn(
                                                            `Wrong dataId ${templates[template].widgets[widget].data["oid-dataId"]} for ${widget} - ${template} - ${folder} - ${vis}`,
                                                        );
                                                    }
                                                    if (splitEnabledId.length != 5 || splitEnabledId[4] != "enabled") {
                                                        this.log.warn(
                                                            `Wrong dataId ${templates[template].widgets[widget].data["oid-enabled"]} for ${widget} - ${template} - ${folder} - ${vis}`,
                                                        );
                                                    }
                                                    if (splitEnabledId[3] != splitDataId[3]) {
                                                        this.log.warn(
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
        this.log.debug("newViews: " + JSON.stringify(newViews));
        if (Object.keys(newViews).length > 0) {
            for (const stateId in newViews) {
                const id = stateId.replace("data", "views");
                await this.setState(id, { val: JSON.stringify(newViews[stateId]), ack: true });
            }
        }
    }

    private async fixStateStructure(statesInSettings: { onOff: number[] }): Promise<void> {
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
                    this.tempCreateView(id);
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

    private async deleteOnOffSchedule(id: number): Promise<void> {
        await this.delObjectAsync(`onoff.${id.toString()}`, { recursive: true });
    }

    private async tempCreateView(id: number): Promise<void> {
        await this.setObjectNotExistsAsync(`onoff.${id.toString()}.views`, {
            type: "state",
            common: {
                name: {
                    en: "Views",
                    de: "Ansichten",
                    ru: "Просмотров",
                    pt: "Vistas",
                    nl: "Weergaven",
                    fr: "Vues",
                    it: "Visite",
                    es: "Vistas",
                    pl: "Widok",
                    uk: "Погляд",
                    "zh-cn": "视图",
                },
                read: true,
                write: false,
                type: "string",
                role: "json",
                def: `{}`,
                desc: "Contains all widgets",
            },
            native: {},
        });
        await this.setState(`onoff.${id.toString()}.views`, { val: JSON.stringify({}), ack: true });
        const objState = await this.getObjectAsync(`onoff.${id.toString()}.data`);
        const state = await this.getStateAsync(`onoff.${id.toString()}.data`);
        const valState = state && state.val && typeof state.val === "string" ? JSON.parse(state.val) : {};
        if (objState && objState.common && valState && valState.name && valState.name != objState?.common.name) {
            await this.extendObject(`onoff.${id.toString()}`, { common: { name: valState.name } });
            await this.extendObject(`onoff.${id.toString()}.data`, { common: { name: valState.name } });
        }
    }

    private async createOnOffSchedule(id: number): Promise<void> {
        await this.setObjectNotExistsAsync("onoff", {
            type: "device",
            common: {
                name: "onoff",
                desc: "Created by Adapter",
            },
            native: {},
        });
        await this.setObjectNotExistsAsync(`onoff.${id.toString()}`, {
            type: "channel",
            common: {
                name: "New Schedule",
                desc: "Created by Adapter",
            },
            native: {},
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
                desc: "Contains the schedule data (triggers, etc.)",
            },
            native: {},
        });
        await this.setObjectNotExistsAsync(`onoff.${id.toString()}.views`, {
            type: "state",
            common: {
                name: "data",
                read: true,
                write: false,
                type: "string",
                role: "json",
                def: `{}`,
                desc: "Contains all widgets",
            },
            native: {},
        });
        await this.setObjectNotExistsAsync(`onoff.${id.toString()}.views`, {
            type: "state",
            common: {
                name: "data",
                read: true,
                write: false,
                type: "string",
                role: "json",
                def: `{}`,
                desc: "Contains all widgets",
            },
            native: {},
        });
        await this.setObjectNotExistsAsync(`onoff.${id.toString()}.enabled`, {
            type: "state",
            common: {
                name: "enabled",
                read: true,
                write: true,
                type: "boolean",
                role: "switch",
                def: false,
                desc: "Enables/disables automatic switching for this schedule",
            },
            native: {},
        });
    }

    private async onScheduleChange(id: string, scheduleString: string): Promise<void> {
        this.log.debug("onScheduleChange: " + scheduleString + " " + id);
        if (this.scheduleIdToSchedule.get(id)) {
            this.log.debug("schedule found: " + this.scheduleIdToSchedule.get(id));
        }
        try {
            const schedule = (await this.createNewOnOffScheduleSerializer(id)).deserialize(scheduleString);
            const enabledState = await this.getStateAsync(ScheduleSwitcher.getEnabledIdFromScheduleId(id));
            if (enabledState) {
                this.scheduleIdToSchedule.get(id)?.destroy();
                schedule.setEnabled(enabledState.val as boolean);
                this.scheduleIdToSchedule.set(id, schedule);
            } else {
                this.log.error(`Could not retrieve state enabled state for ${id}`);
            }
        } catch (e) {
            this.logError(e as Error);
        }
    }

    private async getCoordinate(): Promise<Coordinate> {
        if (this.coordinate) {
            return Promise.resolve(this.coordinate);
        } else {
            return new Promise((resolve, _) => {
                this.getForeignObject("system.config", (error, obj) => {
                    if (obj && obj.common) {
                        const lat = (obj.common as any).latitude;
                        const long = (obj.common as any).longitude;
                        if (lat && long) {
                            this.log.debug(`Got coordinates lat=${lat} long=${long}`);
                            resolve(new Coordinate(lat, long, this));
                            return;
                        }
                    }
                    this.log.error(
                        "Could not read coordinates from system.config, using Berlins coordinates as fallback",
                    );
                    resolve(new Coordinate(52, 13, this));
                });
            });
        }
    }

    private logError(error: Error): void {
        this.log.error(error.stack || `${error.name}: ${error.message}`);
    }

    private async createNewOnOffScheduleSerializer(dataId: string): Promise<OnOffScheduleSerializer> {
        const actionSerializer = new UniversalSerializer<Action>(
            [new OnOffStateActionSerializer(this.stateService)],
            this.loggingService,
        );
        actionSerializer.useSerializer(
            new ConditionActionSerializer(
                new UniversalSerializer<Condition>(
                    [
                        new StringStateAndConstantConditionSerializer(this.stateService),
                        new StringStateAndStateConditionSerializer(this.stateService),
                    ],
                    this.loggingService,
                ),
                actionSerializer,
                this,
            ),
        );
        const triggerSerializer = new UniversalSerializer<Trigger>(
            [
                new TimeTriggerSerializer(actionSerializer),
                new AstroTriggerSerializer(actionSerializer),
                new OneTimeTriggerSerializer(actionSerializer, (triggerId: string) => {
                    this.messageService?.handleMessage({
                        message: {
                            dataId: dataId,
                            triggerId: triggerId,
                        },
                        command: "delete-trigger",
                        from: "schedule-switcher.0",
                    } as any as ioBroker.Message);
                }),
            ],
            this.loggingService,
        );
        return new OnOffScheduleSerializer(
            new UniversalTriggerScheduler([
                new TimeTriggerScheduler(this.stateService, scheduleJob, cancelJob, this.loggingService),
                new AstroTriggerScheduler(
                    new TimeTriggerScheduler(this.stateService, scheduleJob, cancelJob, this.loggingService),
                    getTimes,
                    await this.getCoordinate(),
                    this.loggingService,
                ),
                new OneTimeTriggerScheduler(scheduleJob, cancelJob, this.loggingService, this),
            ]),
            actionSerializer,
            triggerSerializer,
            this,
        );
    }

    /**
     * Is called when vis-2 receives a message.
     */
    private async setSendTo(data: string): Promise<void> {
        const send = JSON.parse(data);
        this.log.debug(JSON.stringify(send));
        try {
            if (this.messageService) {
                await this.messageService.handleMessage(send);
            } else {
                this.log.error("Message service not initialized");
            }
        } catch (e) {
            this.logError(e as Error);
            this.log.error(`Could not handle message:`);
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new ScheduleSwitcher(options);
} else {
    // otherwise start the instance directly
    (() => new ScheduleSwitcher())();
}
