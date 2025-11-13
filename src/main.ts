/*
 * Created with @iobroker/create-adapter v2.6.5
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";
import { cancelJob, RecurrenceRule, scheduleJob } from "node-schedule";
import { getTimes } from "suncalc";
import { Coordinate } from "./Coordinate";
import { VisHtmlTable } from "./html/VisHtmlTable";
import { VisWidgetOverview } from "./html/VisWidgetOverview";
import { AstroTriggerScheduler } from "./scheduler/AstroTriggerScheduler";
import { OneTimeTriggerScheduler } from "./scheduler/OneTimeTriggerScheduler";
import { TimeTriggerScheduler } from "./scheduler/TimeTriggerScheduler";
import { UniversalTriggerScheduler } from "./scheduler/UniversalTriggerScheduler";
import type { Schedule } from "./schedules/Schedule";
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
import { IoBrokerValidationState } from "./services/IoBrokerValidationState";
import { IoBrokerValidationView } from "./services/IoBrokerValidationView";
import { MessageService } from "./services/MessageService";
import type { Action } from "./types/Action";
import type { Condition } from "./types/Condition";
import type { schedulesData } from "./types/SchedulesData";
import type { Trigger } from "./types/Trigger";
import type { ValidationState } from "./types/ValidationState";

class ScheduleSwitcher extends utils.Adapter {
    private scheduleIdToSchedule: Map<string, Schedule> = new Map<string, Schedule>();
    private loggingService = new IoBrokerLoggingService(this);
    private messageService: MessageService | undefined;
    private widgetControl: any;
    private nextAstroTime: any;
    private nextActionTime: any;
    private setCountTriggerStart: ioBroker.Timeout | undefined | null;
    private vishtmltable = new VisHtmlTable(this);
    private visWidgetOverview = new VisWidgetOverview(this);
    private validation: ValidationState | undefined;
    private stateService = new IoBrokerStateService(this);
    private validationView = new IoBrokerValidationView(this);

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
        this.setCountTriggerStart = null;
    }

    private getEnabledIdFromScheduleId(scheduleId: string): string {
        return scheduleId.replace("data", "enabled");
    }

    private getScheduleIdFromEnabledId(scheduleId: string): string {
        return scheduleId.replace("enabled", "data");
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        if (!this.config.usehtml) {
            await this.delObjectAsync("html", { recursive: true });
        }
        await this.checkValueAttribute();
        const obj = await this.getForeignObjectAsync("system.config");
        let lang = "de";
        if (obj && obj.common && obj.common.language) {
            lang = obj.common.language;
        }
        if (this.config.usehtml) {
            await this.vishtmltable.createStates(lang);
        }
        this.config.schedules.onOff = await this.checkConfig(this.config.schedulesData as Array<schedulesData>);
        this.log.debug(`onoff: ${JSON.stringify(this.config.schedules.onOff)}`);
        await this.initValidation();
        await this.initMessageService();
        await this.fixStateStructure(this.config.schedules);
        await this.validationView.validationView(utils.getAbsoluteDefaultDataDir());
        await this.validation?.setNextAstroTime(false);
        await this.validation?.setActionTime();
        const record = await this.getStatesAsync(`schedule-switcher.${this.instance}.onoff.*`);
        for (const id in record) {
            if (id.toString().indexOf(".data") !== -1) {
                const state = record[id];
                await this.vishtmltable.changeTrigger(id, state, false);
                this.log.debug(`got state: ${state ? JSON.stringify(state) : "null"} with id: ${id}`);
                if (state) {
                    this.log.info(`ID: ${id}`);
                    if (typeof state.val === "string" && state.val.startsWith("{")) {
                        const stateVal = JSON.parse(state.val);
                        if (stateVal && stateVal.active == null) {
                            stateVal.active = false;
                            await this.setState(id, { val: JSON.stringify(stateVal), ack: true });
                        }
                        await this.validation?.validation(id, stateVal, false);
                        this.log.debug(`Start: ${id} - ${JSON.stringify(stateVal)}`);
                        if (typeof stateVal === "object" && Object.keys(stateVal).length > 0) {
                            await this.onScheduleChange(id, JSON.stringify(stateVal));
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
        }
        this.refreshAstroTime();
        this.refreshActionTime();
        await this.vishtmltable.updateHTML();
        this.subscribeStates(`*`);
        await this.visWidgetOverview.createOverview();
        this.refreshValiditionView();
        this.setCountTriggerStart = this.setTimeout(async () => {
            await this.messageService?.setCountTrigger();
            this.setCountTriggerStart = undefined;
            this.moreLogs();
        }, 5 * 1000);
    }

    private async onUnload(callback: () => void): Promise<void> {
        this.log.info("cleaning everything up...");
        this.setCountTriggerStart && this.clearTimeout(this.setCountTriggerStart);
        for (const id of this.scheduleIdToSchedule.keys()) {
            try {
                this.scheduleIdToSchedule.get(id)?.destroy();
            } catch (e) {
                this.logError(e as Error);
                this.log.error(`ScheduleIdToSchedule!`);
            }
        }
        try {
            this.scheduleIdToSchedule.clear();
        } catch (e) {
            this.logError(e as Error);
            this.log.error(`scheduleIdToSchedule clear!`);
        }
        await this.vishtmltable.destroy();
        await this.nextAstroTime?.cancel();
        await this.nextActionTime?.cancel();
        await this.widgetControl?.cancel();
        await this.messageService?.destroy();
        await this.stateService.destroy();
        callback();
    }

    private refreshAstroTime(): void {
        const rule = new RecurrenceRule();
        rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
        rule.hour = 2;
        rule.minute = 0;
        rule.second = 10;
        this.nextAstroTime = scheduleJob(rule, async () => {
            this.log.info("Start Update Astrotime!");
            await this.validation?.setNextAstroTime(true);
        });
    }

    private refreshActionTime(): void {
        const rule = new RecurrenceRule();
        rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
        rule.hour = 0;
        rule.minute = 1;
        this.nextActionTime = scheduleJob(rule, async () => {
            this.log.info("Start Update next time switch!");
            await this.validation?.setActionTime();
        });
    }

    private refreshValiditionView(): void {
        const rule = new RecurrenceRule();
        rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
        rule.hour = 3;
        rule.minute = 4;
        rule.second = 22;
        this.widgetControl = scheduleJob(rule, async () => {
            this.log.info("Start Update View!");
            await this.validationView.validationView(utils.getAbsoluteDefaultDataDir());
            await this.visWidgetOverview.createOverview();
        });
    }

    private moreLogs(): void {
        for (const id of this.scheduleIdToSchedule.keys()) {
            this.scheduleIdToSchedule.get(id)?.loadregister();
        }
    }

    private async checkConfig(config: Array<schedulesData>): Promise<any> {
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
            let isChange = false;
            for (const state of config) {
                let count = 0;
                if (state.stateId == null) {
                    const nextid: number = await this.nextId(allIds, 0);
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
            //if (allIds.length != this.config.schedules.onOff.length) {
            //    this.log.debug(`Difference ${allIds.length} - ${this.config.schedules.onOff.length}`);
            //    isChange = true;
            //}
            if (isChange) {
                this.log.info(
                    `Cleanup native...restart adapter now... ${JSON.stringify(config)} - ${JSON.stringify(allIds)}`,
                );
                await this.extendForeignObjectAsync(`system.adapter.${this.namespace}`, {
                    native: { schedulesData: config, schedules: { onOff: allIds } },
                });
            }
            return allIds;
        }
    }

    private nextId(ids: number[], start: number): Promise<number> {
        const removeDuplicate = (arr: number[]): number[] => {
            return arr.filter((item, index) => arr.indexOf(item) === index);
        };
        ids.sort((a, b) => a - b);
        removeDuplicate(ids).every(a => {
            if (start === a) {
                start = a + 1;
                return true;
            }
        });
        return Promise.resolve(start);
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
     * @param id Object ID
     * @param state State value
     */
    private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
        if (state) {
            if (!state.ack) {
                const command = id.split(".").pop();
                if (command === "data") {
                    void this.updateData(id, state);
                } else if (command === "enabled") {
                    void this.updateEnabled(id, state);
                } else if (command === "sendto" && typeof state.val === "string") {
                    this.log.debug("is sendto id");
                    void this.setSendTo(state.val);
                } else if (command === "update" && state.val) {
                    void this.updateHTMLCode(id);
                    return;
                }
                const secsplit = id.split(".")[id.split(".").length - 2];
                if (
                    secsplit === "html" &&
                    typeof command === "string" &&
                    command != "html_code" &&
                    command != "update"
                ) {
                    void this.updateHTML(id, state, command);
                } else {
                    await this.stateService.setState(id, state.val, true);
                }
            }
        }
    }

    /**
     * @param obj If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
     */
    private async onMessage(obj: ioBroker.Message): Promise<void> {
        if (typeof obj === "object" && obj.message) {
            try {
                this.log.debug(`obj: ${JSON.stringify(obj)}`);
                switch (obj.command) {
                    case "update-actionTime":
                        void this.validation?.setActionTime();
                        this.log.debug(`Finished onMessage actionTime`);
                        break;
                    case "update-nextTime":
                        void this.validation?.setNextAstroTime(true);
                        this.log.debug(`Finished onMessage nextTime`);
                        break;
                    case "update-html":
                        void this.vishtmltable.updateStateHTML();
                        this.log.debug(`Finished onMessage update HTML`);
                        break;
                    case "update-view":
                        void this.validationView.validationView(utils.getAbsoluteDefaultDataDir());
                        this.log.debug(`Finished onMessage update view`);
                        break;
                    case "getActiv":
                        if (obj && obj.message && obj.message.schedule != null) {
                            void this.loadData(obj, 1);
                        } else {
                            this.sendTo(obj.from, obj.command, `false`, obj.callback);
                        }
                        break;
                    case "getNameSchedule":
                        if (obj && obj.message && obj.message.schedule != null) {
                            void this.loadData(obj, 4);
                        } else {
                            this.sendTo(obj.from, obj.command, `New Schedule`, obj.callback);
                        }
                        break;
                    case "getCountSchedule":
                        if (obj && obj.message && obj.message.schedule != null) {
                            void this.loadData(obj, 3);
                        } else {
                            this.sendTo(obj.from, obj.command, `0`, obj.callback);
                        }
                        break;
                    case "getIdNameSchedule":
                        if (obj && obj.message && obj.message.schedule != null) {
                            void this.loadData(obj, 2);
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
                    case "change-active":
                        if (this.messageService) {
                            if (obj.message && obj.message.parameter && obj.command === "add-trigger" && obj.callback) {
                                void this.addNewTrigger(obj);
                                return;
                            }
                            if (obj.message && obj.message.parameter) {
                                obj.message = obj.message.parameter;
                            }
                            await this.messageService.handleMessage(obj);
                        } else {
                            this.log.error("Message service not initialized");
                        }
                        break;
                    case "week":
                    case "astro":
                    case "datetime":
                    case "time":
                    case "valueCheck":
                        void this.changeTrigger(obj);
                        break;
                    default:
                        this.log.error(`Message service ${obj.command} not initialized`);
                }
            } catch (e) {
                this.logError(e as Error);
                this.log.error(`Could not handle message:`);
            }
        }
    }

    private async updateHTML(id: string, state: ioBroker.State | null | undefined, command: string): Promise<void> {
        await this.vishtmltable.changeHTML(command, state);
        if (state) {
            await this.setState(id, { val: state.val, ack: true });
        }
    }

    private async updateData(id: string, state: ioBroker.State | null | undefined): Promise<void> {
        this.log.debug("is schedule id start");
        await this.vishtmltable.changeTrigger(id, state);
        if (state) {
            await this.onScheduleChange(id, state.val as string);
        }
        this.log.debug("is schedule id end");
    }

    private async updateEnabled(id: string, state: ioBroker.State | null | undefined): Promise<void> {
        this.log.debug("is enabled id start");
        await this.vishtmltable.changeEnabled(id, state);
        const dataId = this.getScheduleIdFromEnabledId(id);
        const scheduleData = (await this.getStateAsync(dataId))?.val;
        await this.onScheduleChange(dataId, scheduleData as string);
        this.log.debug("is enabled id end");
    }

    private async updateHTMLCode(id: string): Promise<void> {
        await this.validation?.setNextAstroTime(true);
        await this.vishtmltable.updateHTML();
        await this.setState(id, false, true);
    }

    private async changeTrigger(obj: ioBroker.Message): Promise<void> {
        let valueTrigger: ioBroker.State | null | undefined;
        if (obj.message.dataid) {
            valueTrigger = await this.getStateAsync(obj.message.dataid);
        } else {
            this.log.warn(`Missing dataId ${JSON.stringify(obj.message)}`);
            return;
        }
        switch (obj.command) {
            case "week":
                if (valueTrigger && typeof valueTrigger.val === "string") {
                    const triggers = JSON.parse(valueTrigger.val);
                    const trigger = triggers.triggers.find((t: any) => t.id === obj.message.triggerid);
                    if (trigger) {
                        if (trigger.weekdays.includes(obj.message.changeid)) {
                            trigger.weekdays = trigger.weekdays.filter((t: any) => t !== obj.message.changeid);
                        } else {
                            trigger.weekdays.push(obj.message.changeid);
                            trigger.weekdays.sort((a: any, b: any) => a - b);
                            if (trigger.weekdays.includes(0)) {
                                trigger.weekdays.shift();
                                trigger.weekdays.push(0);
                            }
                        }
                        if (this.messageService) {
                            const data = {
                                dataId: obj.message.dataid,
                                trigger: trigger,
                            };
                            obj.command = "update-trigger";
                            obj.message = data;
                            await this.messageService.handleMessage(obj);
                            valueTrigger.val = JSON.stringify(triggers);
                            void this.vishtmltable.changeTrigger(obj.message.dataId, valueTrigger);
                        } else {
                            this.log.error("Message service not initialized");
                        }
                    } else {
                        this.log.warn(`Missing trigger ${JSON.stringify(obj.message)} - ${valueTrigger.val}`);
                    }
                } else {
                    this.log.warn(`Missing dataId ${JSON.stringify(obj.message)}`);
                }
                break;
            case "astro":
                if (valueTrigger && typeof valueTrigger.val === "string") {
                    const triggers = JSON.parse(valueTrigger.val);
                    const trigger = triggers.triggers.find((t: any) => t.id === obj.message.triggerid);
                    if (trigger) {
                        trigger.astroTime = obj.message.astrotime;
                        trigger.shiftInMinutes = obj.message.shift;
                        if (this.messageService) {
                            const data = {
                                dataId: obj.message.dataid,
                                trigger: trigger,
                            };
                            obj.command = "update-trigger";
                            obj.message = data;
                            await this.messageService.handleMessage(obj);
                            valueTrigger.val = JSON.stringify(triggers);
                            void this.vishtmltable.changeTrigger(obj.message.dataId, valueTrigger);
                        } else {
                            this.log.error("Message service not initialized");
                        }
                    } else {
                        this.log.warn(`Missing trigger ${JSON.stringify(obj.message)} - ${valueTrigger.val}`);
                    }
                } else {
                    this.log.warn(`Missing dataId ${JSON.stringify(obj.message)}`);
                }
                break;
            case "datetime":
                if (valueTrigger && typeof valueTrigger.val === "string") {
                    const triggers = JSON.parse(valueTrigger.val);
                    const trigger = triggers.triggers.find((t: any) => t.id === obj.message.triggerid);
                    if (trigger) {
                        trigger.date = new Date(obj.message.time).toISOString();
                        if (this.messageService) {
                            const data = {
                                dataId: obj.message.dataid,
                                trigger: trigger,
                            };
                            obj.command = "add-one-time-trigger";
                            obj.message = data;
                            await this.messageService.handleMessage(obj);
                            valueTrigger.val = JSON.stringify(triggers);
                            void this.vishtmltable.changeTrigger(obj.message.dataId, valueTrigger);
                        } else {
                            this.log.error("Message service not initialized");
                        }
                    } else {
                        this.log.warn(`Missing trigger ${JSON.stringify(obj.message)} - ${valueTrigger.val}`);
                    }
                } else {
                    this.log.warn(`Missing dataId ${JSON.stringify(obj.message)}`);
                }
                break;
            case "time":
                if (valueTrigger && typeof valueTrigger.val === "string") {
                    const triggers = JSON.parse(valueTrigger.val);
                    const trigger = triggers.triggers.find((t: any) => t.id === obj.message.triggerid);
                    if (trigger) {
                        const splittime = obj.message.time.split(":");
                        trigger.hour = parseFloat(splittime[0]);
                        trigger.minute = parseFloat(splittime[1]);
                        if (this.messageService) {
                            const data = {
                                dataId: obj.message.dataid,
                                trigger: trigger,
                            };
                            obj.command = "update-trigger";
                            obj.message = data;
                            await this.messageService.handleMessage(obj);
                            valueTrigger.val = JSON.stringify(triggers);
                            void this.vishtmltable.changeTrigger(obj.message.dataId, valueTrigger);
                        } else {
                            this.log.error("Message service not initialized");
                        }
                    } else {
                        this.log.warn(`Missing trigger ${JSON.stringify(obj.message)} - ${valueTrigger.val}`);
                    }
                } else {
                    this.log.warn(`Missing dataId ${JSON.stringify(obj.message)}`);
                }
                break;
            case "valueCheck":
                if (valueTrigger && typeof valueTrigger.val === "string") {
                    const triggers = JSON.parse(valueTrigger.val);
                    const trigger = triggers.triggers.find((t: any) => t.id === obj.message.triggerid);
                    if (trigger) {
                        trigger.valueCheck = obj.message.changeval ? false : true;
                        if (this.messageService) {
                            const data = {
                                dataId: obj.message.dataid,
                                trigger: trigger,
                            };
                            this.log.error(JSON.stringify(data));
                            obj.command = "update-trigger";
                            obj.message = data;
                            await this.messageService.handleMessage(obj);
                            valueTrigger.val = JSON.stringify(triggers);
                            void this.vishtmltable.changeTrigger(obj.message.dataId, valueTrigger);
                        } else {
                            this.log.error("Message service not initialized");
                        }
                    } else {
                        this.log.warn(`Missing trigger ${JSON.stringify(obj.message)} - ${valueTrigger.val}`);
                    }
                } else {
                    this.log.warn(`Missing dataId ${JSON.stringify(obj.message)}`);
                }
                break;
            default:
                this.log.error(`HTML message service ${obj.command} not initialized`);
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

    private async checkValueAttribute(): Promise<void> {
        const record = await this.getStatesAsync(`schedule-switcher.${this.instance}.onoff.*`);
        for (const id in record) {
            if (id.toString().indexOf(".data") !== -1) {
                const state = record[id];
                if (state) {
                    if (typeof state.val === "string" && state.val.startsWith("{")) {
                        const triggers = JSON.parse(state.val);
                        if (triggers && triggers.triggers && triggers.triggers.length > 0) {
                            let isSave = false;
                            for (const trigger of triggers.triggers) {
                                if (trigger.valueCheck == null) {
                                    trigger.valueCheck = false;
                                    isSave = true;
                                }
                            }
                            if (isSave) {
                                await this.setState(id, { val: JSON.stringify(triggers), ack: true });
                            }
                        }
                    }
                }
            }
        }
        const history = await this.getStateAsync(`schedule-switcher.${this.instance}.history`);
        if (history && history.val && typeof history.val === "string" && history.val.startsWith("[")) {
            const history_array = JSON.parse(history.val);
            const new_history = [];
            let isOld = false;
            for (const val of history_array) {
                if (val && val.time == null) {
                    new_history.push(val);
                } else {
                    isOld = true;
                }
            }
            if (isOld) {
                await this.setState(`schedule-switcher.${this.instance}.history`, {
                    val: JSON.stringify(new_history),
                    ack: true,
                });
            }
        }
    }

    private async initValidation(): Promise<void> {
        this.validation = new IoBrokerValidationState(this, await this.getCoordinate());
    }

    private async initMessageService(): Promise<void> {
        this.messageService = new MessageService(
            this.stateService,
            this.scheduleIdToSchedule,
            this.createNewOnOffScheduleSerializer.bind(this),
            this,
            await this.getCoordinate(),
            this.validation,
            this.vishtmltable,
            getTimes,
        );
    }

    private async fixStateStructure(statesInSettings: { onOff: number[] }): Promise<void> {
        if (!statesInSettings) {
            statesInSettings = { onOff: [] };
        }
        if (!statesInSettings.onOff) {
            statesInSettings.onOff = [];
        }
        const currentStates = await this.getStatesAsync(`schedule-switcher.${this.instance}.onoff.*`);
        for (const fullId in currentStates) {
            if (fullId.toString().indexOf(".data") !== -1) {
                const split = fullId.split(".");
                const type = split[2];
                const id = Number.parseInt(split[3], 10);
                if (type == "onoff") {
                    if (statesInSettings.onOff.includes(id)) {
                        statesInSettings.onOff = statesInSettings.onOff.filter(i => i !== id);
                        this.log.debug(`Found state ${fullId}`);
                    } else {
                        this.log.debug(`Deleting state ${fullId}`);
                        await this.deleteOnOffSchedule(id);
                    }
                }
            }
        }
        for (const i of statesInSettings.onOff) {
            this.log.debug(`Onoff state ${i} not found, creating`);
            await this.createOnOffSchedule(i);
        }
    }

    private async deleteOnOffSchedule(id: number): Promise<void> {
        await this.delObjectAsync(`onoff.${id.toString()}`, { recursive: true });
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
                    "active": false,
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
                name: {
                    en: "Created widgets",
                    de: "Erstellte Widgets",
                    ru: "Созданные виджеты",
                    pt: "Widgets criados",
                    nl: "Aangemaakte widgets",
                    fr: "Création de widgets",
                    it: "Widget creati",
                    es: "Widgets creados",
                    pl: "Tworzone widżety",
                    uk: "Створені віджети",
                    "zh-cn": "创建部件",
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
        await this.setObjectNotExistsAsync(`onoff.${id.toString()}.enabled`, {
            type: "state",
            common: {
                name: {
                    en: "enable/disable",
                    de: "aktivieren/deaktivieren",
                    ru: "включить/отключить",
                    pt: "ativar/desativar",
                    nl: "inschakelen/uitschakelen",
                    fr: "activer/désactiver",
                    it: "abilitare/disabilitare",
                    es: "habilitar/deshabilitar",
                    pl: "włączyć/wyłączyć",
                    uk: "увімкнути/вимкнути",
                    "zh-cn": "启用/禁用",
                },
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
        this.log.debug(`onScheduleChange: ${scheduleString} ${id}`);
        if (this.scheduleIdToSchedule.get(id)) {
            this.log.debug(`schedule found: ${this.scheduleIdToSchedule.get(id)?.getName()}`);
        }
        try {
            const schedule = (await this.createNewOnOffScheduleSerializer(id)).deserialize(scheduleString);
            const enabledState = await this.getStateAsync(this.getEnabledIdFromScheduleId(id));
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
        const obj = await this.getForeignObjectAsync("system.config");
        if (obj && obj.common && obj.common.latitude && obj.common.longitude) {
            const lat = obj.common.latitude;
            const long = obj.common.longitude;
            this.log.debug(`Got coordinates lat=${lat} long=${long}`);
            return new Coordinate(lat, long, this.loggingService);
        }
        this.log.error("Could not read coordinates from system.config, using Berlins coordinates as fallback");
        return new Coordinate(52, 13, this.loggingService);
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
                this.loggingService,
            ),
        );
        const triggerSerializer = new UniversalSerializer<Trigger>(
            [
                new TimeTriggerSerializer(actionSerializer),
                new AstroTriggerSerializer(actionSerializer),
                new OneTimeTriggerSerializer(actionSerializer, async (triggerId: string) => {
                    await this.messageService?.handleMessage({
                        message: {
                            dataId: dataId,
                            triggerId: triggerId,
                        },
                        command: "delete-trigger",
                        from: this.namespace,
                    } as any as ioBroker.Message);
                }),
            ],
            this.loggingService,
        );
        return new OnOffScheduleSerializer(
            new UniversalTriggerScheduler(
                [
                    new TimeTriggerScheduler(scheduleJob, cancelJob, this.loggingService),
                    new AstroTriggerScheduler(
                        new TimeTriggerScheduler(scheduleJob, cancelJob, this.loggingService),
                        getTimes,
                        await this.getCoordinate(),
                        this.loggingService,
                    ),
                    new OneTimeTriggerScheduler(scheduleJob, cancelJob, this.loggingService, this),
                ],
                this.loggingService,
            ),
            actionSerializer,
            triggerSerializer,
            this.loggingService,
        );
    }

    private async setSendTo(data: string): Promise<void> {
        const send = JSON.parse(data);
        this.log.debug(JSON.stringify(send));
        try {
            if (
                send.command === "week" ||
                send.command === "astro" ||
                send.command === "datetime" ||
                send.command === "time"
            ) {
                await this.changeTrigger(send);
                return;
            }
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
