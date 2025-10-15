import { getTimes } from "suncalc";
import type { Coordinate } from "../Coordinate";
import type { OnOffStateAction } from "../actions/OnOffStateAction";
import type { VisHtmlTable } from "../html/VisHtmlTable";
import { OnOffSchedule } from "../schedules/OnOffSchedule";
import type { Schedule } from "../schedules/Schedule";
import type { OnOffScheduleSerializer } from "../serialization/OnOffScheduleSerializer";
import { AstroTime } from "../triggers/AstroTime";
import { AstroTriggerBuilder } from "../triggers/AstroTriggerBuilder";
import type { DailyTriggerBuilder } from "../triggers/DailyTriggerBuilder";
import { TimeTriggerBuilder } from "../triggers/TimeTriggerBuilder";
import type { Trigger } from "../triggers/Trigger";
import { AllWeekdays } from "../triggers/Weekday";
import type { IoBrokerValidationState } from "./IoBrokerValidationState";
import type { StateService } from "./StateService";

/**
 * @param currentMessage ioBroker.Message | null
 * @param triggerTimeout ioBroker.Timeout | undefined
 */
export class MessageService {
    private currentMessage: ioBroker.Message | null = null;
    private triggerTimeout: ioBroker.Timeout | undefined;

    /**
     * Messages
     *
     * @param stateService Nothing
     * @param scheduleIdToSchedule Nothing
     * @param createOnOffScheduleSerializer Nothing
     * @param adapter Nothing
     * @param coordinate Nothing
     * @param validation Nothing
     * @param html Nothing
     */
    constructor(
        private stateService: StateService,
        private scheduleIdToSchedule: Map<string, Schedule>,
        private createOnOffScheduleSerializer: (dataId: string) => Promise<OnOffScheduleSerializer>,
        private adapter: ioBroker.Adapter,
        private readonly coordinate: Coordinate,
        private readonly validation: IoBrokerValidationState | undefined,
        private readonly html: VisHtmlTable,
    ) {
        this.adapter = adapter;
        this.triggerTimeout = undefined;
        this.validation = validation;
        this.html = html;
    }

    /**
     * @param message ioBroker.Message
     */
    public async handleMessage(message: ioBroker.Message): Promise<void> {
        if (this.currentMessage) {
            this.triggerTimeout = this.adapter.setTimeout(async () => {
                await this.handleMessage(message);
                this.triggerTimeout = undefined;
            }, 50);
            return;
        }
        this.currentMessage = message;
        const data: any = message.message;
        if (message.command === "change-view-dataId") {
            await this.updateViews(data);
            this.adapter.log.debug(`Finished message ${message.command}`);
            this.currentMessage = null;
            return;
        }
        this.adapter.log.debug(`Received ${message.command}`);
        this.adapter.log.debug(JSON.stringify(message.message));
        const schedule = this.scheduleIdToSchedule.get(data.dataId);
        let active = false;
        if (!schedule) {
            this.adapter.log.error(`No schedule found for state ${data.dataId}`);
            this.currentMessage = null;
            return;
        }
        switch (message.command) {
            case "add-trigger":
                await this.addTrigger(schedule, data);
                await this.validation?.setActionTime();
                await this.setCountTrigger();
                break;
            case "add-one-time-trigger":
                await this.addOneTimeTrigger(schedule, data);
                await this.validation?.setActionTime();
                await this.setCountTrigger();
                break;
            case "update-one-time-trigger":
                await this.updateOneTimeTrigger(schedule, data.trigger, data.dataId);
                await this.validation?.setActionTime();
                break;
            case "update-trigger":
                if (data.trigger && data.trigger.type === "AstroTrigger") {
                    data.trigger.todayTrigger = await this.nextDate(data.trigger);
                }
                await this.updateTrigger(schedule, data.trigger, data.dataId);
                await this.validation?.setActionTime();
                break;
            case "delete-trigger":
                schedule.removeTrigger(data.triggerId);
                await this.validation?.setActionTime();
                await this.setCountTrigger();
                break;
            case "change-name":
                if (data.name == null) {
                    this.adapter.log.error(`The name cannot be null`);
                    return;
                }
                schedule.setName(data.name);
                await this.changeName(data);
                break;
            case "enable-schedule":
                await this.html.changeEnabled(data.dataId, true);
                schedule.setEnabled(true);
                await this.stateService.setState(this.getEnabledIdFromScheduleId(data.dataId), true);
                await this.setCountTrigger();
                break;
            case "disable-schedule":
                schedule.setEnabled(false);
                await this.html.changeEnabled(data.dataId, false);
                await this.stateService.setState(this.getEnabledIdFromScheduleId(data.dataId), false);
                await this.setCountTrigger();
                break;
            case "change-switched-values":
                await this.changeOnOffSchedulesSwitchedValues(schedule, data);
                break;
            case "change-switched-ids":
                await this.changeOnOffSchedulesSwitchedIds(schedule, data.stateIds);
                await this.setCountTrigger();
                break;
            case "change-active":
                active = true;
                break;
            default:
                this.adapter.log.error("Unknown command received");
                this.currentMessage = null;
                return;
        }
        if (schedule instanceof OnOffSchedule) {
            let saveTrigger;
            saveTrigger = (await this.createOnOffScheduleSerializer(data.dataId)).serialize(schedule);
            if (active) {
                const actual_trigger = JSON.parse(saveTrigger);
                actual_trigger.active = data.active;
                saveTrigger = JSON.stringify(actual_trigger);
            }
            await this.stateService.setState(data.dataId, saveTrigger);
            await this.html.changeTrigger(data.dataId, saveTrigger);
        } else {
            this.adapter.log.error("Cannot update schedule state after message, no serializer found for schedule");
            return;
        }
        this.adapter.log.debug(`Finished message ${message.command}`);
        this.currentMessage = null;
    }

    private async changeName(data: any): Promise<void> {
        const state = data?.dataId.split(".");
        await this.stateService.extendObject(`onoff.${state[3]}`, { common: { name: data?.name } });
        await this.stateService.extendObject(`onoff.${state[3]}.data`, { common: { name: data?.name } });
    }

    private getEnabledIdFromScheduleId(scheduleId: string): string {
        return scheduleId.replace("data", "enabled");
    }

    /**
     * Counter trigger
     */
    public async setCountTrigger(): Promise<void> {
        let count = 0;
        for (const id of this.scheduleIdToSchedule.keys()) {
            try {
                const len = this.scheduleIdToSchedule.get(id)?.getTriggers().length;
                count += len != null ? len : 0;
            } catch (e: any) {
                this.adapter.log.debug(`scheduleIdToSchedule: ${e}`);
            }
        }
        await this.adapter.setState("counterTrigger", count, true);
    }

    private nextDate(data: any): any {
        const next = getTimes(new Date(), this.coordinate.getLatitude(), this.coordinate.getLongitude());
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

    private async addTrigger(schedule: Schedule, data: any): Promise<void> {
        const state = data?.dataId.split(".");
        let triggerBuilder: DailyTriggerBuilder;

        if (data.triggerType === "TimeTrigger") {
            this.adapter.log.debug("Wants TimeTrigger");
            triggerBuilder = new TimeTriggerBuilder()
                .setHour(0)
                .setMinute(0)
                .setObjectId(parseInt(state[3]))
                .setValueCheck(false)
                .setTodayTrigger({});
        } else if (data.triggerType === "AstroTrigger") {
            this.adapter.log.debug("Wants AstroTrigger");
            triggerBuilder = new AstroTriggerBuilder()
                .setAstroTime(AstroTime.Sunrise)
                .setShift(0)
                .setValueCheck(false)
                .setObjectId(parseInt(state[3]))
                .setTodayTrigger(await this.nextDate({ astroTime: "sunrise", shiftInMinutes: 0 }));
        } else {
            this.adapter.log.error(`Cannot add trigger of type ${data.triggerType}`);
            return;
        }

        triggerBuilder.setWeekdays(AllWeekdays).setId(this.getNextTriggerId(schedule.getTriggers()));

        if (data.actionType === "OnOffStateAction" && schedule instanceof OnOffSchedule) {
            this.adapter.log.debug("Wants OnOffStateAction");
            triggerBuilder.setAction(schedule.getOnAction());
        } else {
            this.adapter.log.error(`Cannot add trigger with action of type ${data.actionType}`);
            return;
        }
        schedule.addTrigger(triggerBuilder.build());
    }

    private async updateOneTimeTrigger(schedule: Schedule, triggerString: any, dataId: string): Promise<void> {
        let updated;
        if (isNaN(new Date(triggerString.date).getTime())) {
            this.adapter.log.warn(`Wrong OneTimeDate ${triggerString.date} in ${dataId}`);
            triggerString.date = new Date().toISOString();
        }
        if (triggerString.timedate == null || typeof triggerString.timedate !== "boolean") {
            this.adapter.log.warn(`Wrong timedate ${triggerString.timedate} in ${dataId}`);
            triggerString.timedate = true;
        }
        if (schedule instanceof OnOffSchedule) {
            updated = (await this.createOnOffScheduleSerializer(dataId))
                .getTriggerSerializer(schedule)
                .deserialize(JSON.stringify(triggerString));
        } else {
            this.adapter.log.error(`Can not deserialize trigger for schedule of type ${typeof schedule}`);
            return;
        }
        schedule.updateTrigger(updated);
    }

    private async addOneTimeTrigger(schedule: Schedule, data: any): Promise<void> {
        const t = JSON.parse(data.trigger);
        const id = data.dataId.split(".");
        t.id = this.getNextTriggerId(schedule.getTriggers());
        t.objectId = parseInt(id[3]);
        if (isNaN(new Date(t.date).getTime())) {
            this.adapter.log.warn(`Wrong OneTimeDate ${t.date} in ${id}`);
            t.date = new Date().toISOString();
        }
        if (t.timedate == null || typeof t.timedate !== "boolean") {
            this.adapter.log.warn(`Wrong timedate ${t.timedate} in ${id}`);
            t.timedate = true;
        }
        const trigger = (await this.createOnOffScheduleSerializer(data.dataId))
            .getTriggerSerializer(schedule as OnOffSchedule)
            .deserialize(JSON.stringify(t));
        schedule.addTrigger(trigger);
    }

    private async updateTrigger(schedule: Schedule, triggerString: any, dataId: string): Promise<void> {
        let updated;
        await this.validation?.validation(dataId, triggerString, true);
        if (
            schedule instanceof OnOffSchedule &&
            typeof triggerString === "object" &&
            Object.keys(triggerString).length > 0
        ) {
            updated = (await this.createOnOffScheduleSerializer(dataId))
                .getTriggerSerializer(schedule)
                .deserialize(JSON.stringify(triggerString));
        } else {
            this.adapter.log.error(`Can not deserialize trigger for schedule of type ${typeof schedule}`);
            return;
        }
        schedule.updateTrigger(updated);
    }

    private async updateViews(data: any): Promise<void> {
        if (data) {
            if (data.newId && data.newId.endsWith(".data")) {
                const path = `${data.newId.replace(".data", ".views")}`;
                const pathSplit = path.split(".");
                const id = parseInt(pathSplit[3]);
                if (!isNaN(id)) {
                    const valView = await this.stateService.getState(path);
                    if (valView != null) {
                        const newView = typeof valView === "string" ? JSON.parse(valView) : valView;
                        if (newView && newView[data.namespace] && newView[data.namespace][data.prefix]) {
                            newView[data.namespace][data.prefix][data.widgetId] = data;
                        } else {
                            newView[data.namespace] = {};
                            newView[data.namespace][data.prefix] = {};
                            newView[data.namespace][data.prefix][data.widgetId] = data;
                        }
                        await this.stateService.setState(path, JSON.stringify(newView));
                    }
                }
            }
            if (data.oldId && data.oldId.endsWith(".data")) {
                const oldPath = `${data.oldId.replace(".data", ".views")}`;
                const oldPathSplit = oldPath.split(".");
                const id = parseInt(oldPathSplit[3]);
                if (!isNaN(id)) {
                    const valOldView = await this.stateService.getState(oldPath);
                    if (valOldView != null) {
                        const oldView = typeof valOldView === "string" ? JSON.parse(valOldView) : valOldView;
                        if (
                            oldView &&
                            oldView[data.namespace] &&
                            oldView[data.namespace][data.prefix] &&
                            oldView[data.namespace][data.prefix][data.widgetId]
                        ) {
                            if (Object.keys(oldView[data.namespace]).length === 1) {
                                delete oldView[data.namespace];
                            } else if (Object.keys(oldView[data.namespace][data.prefix]).length === 1) {
                                delete oldView[data.namespace][data.prefix];
                            } else {
                                delete oldView[data.namespace][data.prefix][data.widgetId];
                            }
                            await this.stateService.setState(oldPath, JSON.stringify(oldView));
                        }
                    }
                }
            }
        }
    }

    private async changeOnOffSchedulesSwitchedValues(schedule: Schedule, data: any): Promise<void> {
        if (!(schedule instanceof OnOffSchedule)) {
            this.adapter.log.error(`Cannot change switched values when schedule type is not OnOffSchedule`);
            return;
        }
        const states = schedule.getOnAction().getIdsOfStatesToSet();
        if (states && typeof states === "object") {
            const type = data.valueType;
            for (const stateId of states) {
                if (!stateId) {
                    continue;
                }
                const check = await this.adapter.getForeignObjectAsync(stateId);
                if (!check || check.type != "state") {
                    this.adapter.log.error(`StateId ${stateId} is null/undefined or not state`);
                    return;
                }
                if (!check.common || !check.common.type) {
                    this.adapter.log.error(`Missing type ${JSON.stringify(check)} of ${stateId} !!!}`);
                    return;
                }
                if (check.common && check.common.type == "mixed") {
                    continue;
                }
                if (check.common && check.common.type != type) {
                    this.adapter.log.warn(
                        `The type ${check.common.type} of ${stateId} is incorrect!!! Type in VIS settings - ${type}`,
                    );
                }
            }
        } else {
            this.adapter.log.debug(`StateIds is not an object`);
        }
        // schedule.getOnAction().getBooleanValue()
        if (schedule.getOnAction().getValueType() === data.valueType && data.valueType === "boolean") {
            this.adapter.log.debug("Catch no boolean change!!");
            return;
        }
        if (data.valueType === "boolean") {
            if (data.onValue != null) {
                delete data.onValue;
            }
            if (data.offValue != null) {
                delete data.offValue;
            }
        }
        if (data.valueType === "number") {
            if (!data.onValue || (typeof data.onValue !== "number" && isNaN(Number.parseFloat(data.onValue)))) {
                data.onValue = 0;
            }
            if (!data.offValue || (typeof data.offValue !== "number" && isNaN(Number.parseFloat(data.offValue)))) {
                data.offValue = 0;
            }
        }
        if (data.valueType === "string") {
            if (!data.onValue || typeof data.onValue !== "string") {
                data.onValue = data.onValue.toString();
            }
            if (!data.offValue || typeof data.offValue !== "string") {
                data.offValue = data.offValue.toString();
            }
        }
        schedule.setOnAction(this.changeSwitchedValueOfOnOffScheduleAction(schedule.getOnAction(), data));
        schedule.setOffAction(this.changeSwitchedValueOfOnOffScheduleAction(schedule.getOffAction(), data));
        return;
    }

    private async changeOnOffSchedulesSwitchedIds(schedule: Schedule, stateIds: string[]): Promise<void> {
        if (!(schedule instanceof OnOffSchedule)) {
            this.adapter.log.error(`Cannot change switched ids when schedule type is not OnOffSchedule`);
            return;
        }
        if (typeof stateIds === "object") {
            const type = schedule.getOnAction().getValueType();
            for (const stateId of stateIds) {
                if (!stateId) {
                    continue;
                }
                const check = await this.adapter.getForeignObjectAsync(stateId);
                if (!check || check.type != "state") {
                    this.adapter.log.error(`StateId ${stateId} is null/undefined or not state`);
                    return;
                }
                if (!check.common || !check.common.type) {
                    this.adapter.log.error(`Missing type ${JSON.stringify(check)} of ${stateId} !!!}`);
                    return;
                }
                if (check.common && check.common.type == "mixed") {
                    continue;
                }
                if (check.common && check.common.type != type) {
                    this.adapter.log.warn(
                        `The type ${check.common.type} of ${stateId} is incorrect!!! Type in VIS settings - ${type}`,
                    );
                }
            }
        } else {
            this.adapter.log.warn(`StateIds is not an object`);
            return;
        }
        schedule.getOnAction().setIdsOfStatesToSet(stateIds);
        schedule.getOffAction().setIdsOfStatesToSet(stateIds);
        return;
    }

    private changeSwitchedValueOfOnOffScheduleAction(
        action: OnOffStateAction<string | number | boolean>,
        data: any,
    ): OnOffStateAction<string | number | boolean> {
        switch (data.valueType) {
            case "boolean":
                return action.toBooleanValueType();
                break;
            case "number":
                return action.toNumberValueType(data.onValue, data.offValue);
                break;
            case "string":
                return action.toStringValueType(data.onValue, data.offValue);
                break;
            default:
                throw new Error(`Value Type ${data.valueType} not supported`);
        }
    }

    /**
     * Destroy all triggers
     */
    public destroy(): Promise<boolean> {
        this.triggerTimeout && this.adapter.clearTimeout(this.triggerTimeout);
        this.triggerTimeout = null;
        return Promise.resolve(true);
    }

    private getNextTriggerId(current: Trigger[]): string {
        const numbers = current
            .map(t => t.getId())
            .map(id => Number.parseInt(id, 10))
            .filter(id => !Number.isNaN(id))
            .sort((a, b) => a - b);
        let newId = 0;
        for (let i = 0; i < numbers.length; i++) {
            if (numbers[i] > newId) {
                break;
            } else {
                newId++;
            }
        }
        return newId.toString();
    }
}
