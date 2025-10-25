import * as schedule from "node-schedule";
import type { LoggingService } from "../services/LoggingService";
import { TimeTrigger } from "../triggers/TimeTrigger";
import type { Trigger } from "../triggers/Trigger";
import { TriggerScheduler } from "./TriggerScheduler";

/**
 * TimeTriggerScheduler
 */
export class TimeTriggerScheduler extends TriggerScheduler {
    private registered: [TimeTrigger, schedule.Job][] = [];

    /**
     *
     * @param scheduleJob Schedule
     * @param cancelJob Schedule
     * @param logger Log service
     */
    constructor(
        private scheduleJob: (rule: schedule.RecurrenceRule, callback: schedule.JobCallback) => schedule.Job,
        private cancelJob: (job: schedule.Job) => boolean,
        private logger: LoggingService,
    ) {
        super();
    }

    /**
     * @param trigger TimeTrigger
     */
    public register(trigger: TimeTrigger): void {
        this.logger.logDebug(`Register TimeTriggerScheduler trigger ${trigger}`);
        if (this.getAssociatedJob(trigger)) {
            this.loadregister();
            throw new Error(`TimeTriggerScheduler Trigger ${trigger} is already registered.`);
        } else {
            const newJob = this.scheduleJob(this.createRecurrenceRule(trigger), () => {
                this.logger.logDebug(`Executing TimeTriggerScheduler trigger ${trigger}`);
                trigger.getAction().execute(trigger);
            });
            this.registered.push([trigger, newJob]);
        }
    }

    /**
     * loadregister
     */
    public loadregister(): void {
        for (const r of this.registered) {
            this.logger.logDebug(`Check TimeTriggerScheduler ${r[0]}`);
        }
    }

    /**
     * @param trigger TimeTrigger
     */
    public unregister(trigger: TimeTrigger): void {
        this.logger.logDebug(`Unregister TimeTriggerScheduler trigger ${trigger}`);
        const job = this.getAssociatedJob(trigger);
        if (job) {
            this.cancelJob(job);
            this.removeTrigger(trigger);
        } else {
            this.loadregister();
            throw new Error(`TimeTriggerScheduler Trigger ${trigger} is not registered.`);
        }
    }

    /**
     * destroy
     */
    public destroy(): void {
        this.registered.forEach(r => this.unregister(r[0]));
    }

    /**
     * forType
     */
    public forType(): string {
        return TimeTrigger.prototype.constructor.name;
    }

    private getAssociatedJob(trigger: TimeTrigger): schedule.Job | null {
        const entry = this.registered.find(r => r[0] === trigger);
        if (entry) {
            return entry[1];
        }
        this.loadregister();
        return null;
    }

    private removeTrigger(trigger: Trigger): void {
        this.registered = this.registered.filter(r => r[0] !== trigger);
    }

    private createRecurrenceRule(trigger: TimeTrigger): schedule.RecurrenceRule {
        const rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = trigger.getWeekdays();
        rule.hour = trigger.getHour();
        rule.minute = trigger.getMinute();
        return rule;
    }
}
