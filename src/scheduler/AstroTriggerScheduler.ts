import type { GetTimesResult } from "suncalc";
import type { Coordinate } from "../Coordinate";
import type { LoggingService } from "../services/LoggingService";
import { AstroTrigger } from "../triggers/AstroTrigger";
import type { TimeTrigger } from "../triggers/TimeTrigger";
import { TimeTriggerBuilder } from "../triggers/TimeTriggerBuilder";
import { AllWeekdays } from "../triggers/Weekday";
import type { TimeTriggerScheduler } from "./TimeTriggerScheduler";
import { TriggerScheduler } from "./TriggerScheduler";

/**
 * AstroTriggerScheduler
 */
export class AstroTriggerScheduler extends TriggerScheduler {
    private registered: AstroTrigger[] = [];
    private scheduled: [string, TimeTrigger][] = [];
    private readonly rescheduleTrigger = new TimeTriggerBuilder()
        .setId(`AstroTriggerScheduler-Rescheduler`)
        .setWeekdays(AllWeekdays)
        .setHour(2)
        .setMinute(0)
        .setObjectId(1000)
        .setValueCheck(false)
        .setTodayTrigger({})
        .setAction({
            execute: () => {
                this.logger.logDebug(`Rescheduling astro triggers`);
                for (const s of this.scheduled) {
                    this.timeTriggerScheduler.unregister(s[1]);
                }
                //for (const r of this.registered) {
                //    this.tryScheduleTriggerToday(r);
                //}
                this.loadregister();
                this.timeTriggerScheduler.loadregister();
            },
        })
        .build();

    /**
     * @param timeTriggerScheduler Scheduler
     * @param getTimes GetTimesResult
     * @param coordinate Coodinate
     * @param logger Log service
     */
    constructor(
        private readonly timeTriggerScheduler: TimeTriggerScheduler,
        private readonly getTimes: (date: Date, latitude: number, longitude: number) => GetTimesResult,
        private readonly coordinate: Coordinate,
        private readonly logger: LoggingService,
    ) {
        super();
        //this.timeTriggerScheduler.register(this.rescheduleTrigger);
    }

    /**
     * @param trigger Trigger
     */
    public register(trigger: AstroTrigger): void {
        this.logger.logDebug(`Register astro trigger ${trigger}`);
        if (this.isRegistered(trigger)) {
            this.logger.logWarn(`AstroTrigger ${trigger} is already registered.`);
            this.loadregister();
        } else {
            this.registered.push(trigger);
            this.tryScheduleTriggerToday(trigger);
        }
    }

    /**
     * @param trigger Trigger
     */
    public unregister(trigger: AstroTrigger): void {
        this.logger.logDebug(`Unregister astro trigger ${trigger}`);
        if (this.isRegistered(trigger)) {
            this.registered = this.registered.filter(t => t.getId() !== trigger.getId());
            if (this.isScheduledToday(trigger)) {
                this.scheduled = this.scheduled.filter(s => {
                    if (s[0] === trigger.getId()) {
                        this.timeTriggerScheduler.unregister(s[1]);
                        return false;
                    }
                    return true;
                });
            } else {
                this.logger.logDebug(`AstroTrigger ${trigger} is not today.`);
                this.loadregister();
            }
        } else {
            this.logger.logWarn(`AstroTrigger ${trigger} is not registered.`);
            this.loadregister();
        }
    }

    /**
     * loadregister
     */
    public loadregister(): void {
        for (const r of this.registered) {
            this.logger.logDebug(`Check AstroTriggerRegistered ${r}`);
        }
        for (const s of this.scheduled) {
            this.logger.logDebug(`Check AstroTriggerScheduler ${s[1]}`);
        }
    }

    /**
     * destroy
     */
    public destroy(): void {
        this.timeTriggerScheduler.destroy();
        this.registered = [];
        this.scheduled = [];
    }

    /**
     * forType
     */
    public forType(): string {
        return AstroTrigger.prototype.constructor.name;
    }

    private tryScheduleTriggerToday(trigger: AstroTrigger): void {
        const now = new Date();
        const next = this.nextDate(trigger);
        this.logger.logDebug(`Time ${next.toString()} - Date ${now.toString()}`);
        if (next >= now && trigger.getWeekdays().includes(now.getDay())) {
            const entry = this.registered.find(t => t.getId() === trigger.getId());
            const objectId = entry && typeof entry.getObjectId() === "number" ? entry.getObjectId() : 0;
            const valueCheck = entry && typeof entry.getValueCheck() === "boolean" ? entry.getValueCheck() : false;
            this.removeScheduled(trigger);
            const timeTrigger = new TimeTriggerBuilder()
                .setId(`TimeTriggerForAstroTrigger:${trigger.getId()}`)
                .setHour(next.getHours())
                .setMinute(next.getMinutes())
                .setObjectId(objectId)
                .setValueCheck(valueCheck)
                .setTodayTrigger({
                    hour: next.getHours(),
                    minute: next.getMinutes(),
                    weekday: next.getDay(),
                    date: next,
                })
                .setWeekdays([next.getDay()])
                .setAction({
                    execute: () => {
                        this.logger.logDebug(`Executing astrotrigger ${trigger}`);
                        trigger.getAction().execute(trigger.getData());
                        this.timeTriggerScheduler.unregister(timeTrigger);
                    },
                })
                .build();
            this.logger.logDebug(`Scheduled astro with ${timeTrigger}`);
            this.timeTriggerScheduler.register(timeTrigger);
            this.scheduled.push([trigger.getId(), timeTrigger]);
        } else {
            this.logger.logDebug(`Didn't schedule ${trigger}`);
        }
    }

    private isRegistered(trigger: AstroTrigger): boolean {
        return this.registered.find(r => r.getId() === trigger.getId()) != undefined;
    }

    private isScheduledToday(trigger: AstroTrigger): boolean {
        return this.scheduled.find(s => s[0] === trigger.getId()) != undefined;
    }

    private removeScheduled(trigger: AstroTrigger): void {
        this.logger.logDebug(`Scheduled remove ${trigger}`);
        this.scheduled = this.scheduled.filter(s => s[0] !== trigger.getId());
    }

    private nextDate(trigger: AstroTrigger): Date {
        const next = this.getTimes(new Date(), this.coordinate.getLatitude(), this.coordinate.getLongitude())[
            trigger.getAstroTime()
        ];
        next.setMinutes(next.getMinutes() + trigger.getShiftInMinutes());
        return next;
    }
}
