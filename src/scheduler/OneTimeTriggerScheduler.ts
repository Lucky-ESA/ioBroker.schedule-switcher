import { Job, JobCallback } from "node-schedule";
import { LoggingService } from "../services/LoggingService";
import { OneTimeTrigger } from "../triggers/OneTimeTrigger";
import { TriggerScheduler } from "./TriggerScheduler";

export class OneTimeTriggerScheduler extends TriggerScheduler {
    private registered: [OneTimeTrigger, Job][] = [];
    private triggerTimeout: ioBroker.Timeout | undefined;

    constructor(
        private scheduleJob: (date: Date, callback: JobCallback) => Job,
        private cancelJob: (job: Job) => boolean,
        private logger: LoggingService,
        private adapter: ioBroker.Adapter,
    ) {
        super();
        this.adapter = adapter;
        this.triggerTimeout = undefined;
    }

    public forType(): string {
        return OneTimeTrigger.prototype.constructor.name;
    }

    public register(trigger: OneTimeTrigger): void {
        this.logger.logDebug(`Register trigger ${trigger}`);
        if (this.getAssociatedJob(trigger)) {
            throw new Error(`Trigger ${trigger} is already registered.`);
        }
        if (trigger.getDate() < new Date()) {
            this.logger.logDebug(`Date is in past, deleting trigger ${trigger}`);
            this.triggerTimeout = this.adapter.setTimeout(() => {
                trigger.destroy();
                this.triggerTimeout = undefined;
            }, 2000);
        } else {
            const newJob = this.scheduleJob(trigger.getDate(), () => {
                this.logger.logDebug(`Executing trigger ${trigger}`);
                trigger.getAction().execute(trigger.getData() as any);
            });
            this.registered.push([trigger, newJob]);
        }
    }

    public unregister(trigger: OneTimeTrigger): void {
        this.logger.logDebug(`Unregister trigger ${trigger}`);
        const job = this.getAssociatedJob(trigger);
        if (job) {
            this.cancelJob(job);
            this.removeTrigger(trigger);
        }
    }

    public loadregister(): void {
        for (const r of this.registered) {
            this.logger.logDebug(`OneTimeTriggerScheduler ${r[0]}`);
        }
    }

    public destroy(): void {
        this.triggerTimeout && this.adapter.clearTimeout(this.triggerTimeout);
        this.registered.forEach((r) => this.unregister(r[0]));
    }

    private getAssociatedJob(trigger: OneTimeTrigger): Job | null {
        const entry = this.registered.find((r) => r[0] === trigger);
        if (entry) {
            return entry[1];
        } else {
            return null;
        }
    }

    private removeTrigger(trigger: OneTimeTrigger): void {
        this.registered = this.registered.filter((r) => r[0] !== trigger);
    }
}
