import { Job, JobCallback, RecurrenceRule } from "node-schedule";
import { LoggingService } from "../services/LoggingService";
import { StateService } from "../services/StateService";
import { TimeTrigger } from "../triggers/TimeTrigger";
import { Trigger } from "../triggers/Trigger";
import { TriggerScheduler } from "./TriggerScheduler";

export class TimeTriggerScheduler extends TriggerScheduler {
    private registered: [TimeTrigger, Job][] = [];

    constructor(
        private stateService: StateService,
        private scheduleJob: (rule: RecurrenceRule, callback: JobCallback) => Job,
        private cancelJob: (job: Job) => boolean,
        private logger: LoggingService,
    ) {
        super();
        if (stateService == null) {
            throw new Error("StateService may not be null or undefined.");
        }
        this.stateService = stateService;
    }

    public register(trigger: TimeTrigger): void {
        this.logger.logDebug(`Register TimeTriggerScheduler trigger ${trigger}`);
        if (this.getAssociatedJob(trigger)) {
            this.logger.logWarn(`TimeTriggerScheduler Trigger ${trigger} is already registered.`);
        } else {
            const newJob = this.scheduleJob(this.createRecurrenceRule(trigger), () => {
                this.logger.logDebug(`Executing TimeTriggerScheduler trigger ${trigger}`);
                trigger.getAction().execute(trigger.getData() as any);
            });
            this.registered.push([trigger, newJob]);
        }
    }

    public loadregister(): void {
        for (const r of this.registered) {
            this.logger.logDebug(`Check TimeTriggerScheduler ${r[0]}`);
        }
    }

    public unregister(trigger: TimeTrigger): void {
        this.logger.logDebug(`Unregister TimeTriggerScheduler trigger ${trigger}`);
        const job = this.getAssociatedJob(trigger);
        if (job) {
            this.cancelJob(job);
            this.removeTrigger(trigger);
        } else {
            this.logger.logWarn(`TimeTriggerScheduler Trigger ${trigger} is not registered.`);
            this.loadregister();
        }
    }

    public destroy(): void {
        this.registered.forEach((r) => this.unregister(r[0]));
    }

    public forType(): string {
        return TimeTrigger.prototype.constructor.name;
    }

    private getAssociatedJob(trigger: TimeTrigger): Job | null {
        const entry = this.registered.find((r) => r[0] === trigger);
        if (entry) {
            return entry[1];
        } else {
            this.loadregister();
            return null;
        }
    }

    private removeTrigger(trigger: Trigger): void {
        this.registered = this.registered.filter((r) => r[0] !== trigger);
    }

    private createRecurrenceRule(trigger: TimeTrigger): RecurrenceRule {
        const rule = new RecurrenceRule();
        rule.dayOfWeek = trigger.getWeekdays();
        rule.hour = trigger.getHour();
        rule.minute = trigger.getMinute();
        return rule;
    }
}
