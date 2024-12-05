import type { Job, JobCallback } from "node-schedule";
import type { LoggingService } from "../services/LoggingService";
import { OneTimeTrigger } from "../triggers/OneTimeTrigger";
import { TriggerScheduler } from "./TriggerScheduler";

/**
 * OneTimeTriggerScheduler
 */
export class OneTimeTriggerScheduler extends TriggerScheduler {
    private registered: [OneTimeTrigger, Job][] = [];
    private triggerTimeout: ioBroker.Timeout | undefined;

    /**
     * @param scheduleJob Schedule
     * @param cancelJob Schedule
     * @param logger Log service
     * @param adapter ioBroker
     */
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

    /**
     * forType
     */
    public forType(): string {
        return OneTimeTrigger.prototype.constructor.name;
    }

    /**
     * @param trigger OneTimeTrigger
     */
    public register(trigger: OneTimeTrigger): void {
        this.logger.logDebug(`Register OneTimeTriggerScheduler trigger ${trigger}`);
        if (this.getAssociatedJob(trigger)) {
            this.logger.logWarn(`OneTimeTrigger ${trigger} is already registered.`);
        } else {
            if (trigger.getDate() < new Date()) {
                this.logger.logDebug(`Date is in past, deleting OneTimeTriggerScheduler ${trigger}`);
                this.triggerTimeout = this.adapter.setTimeout(() => {
                    trigger.destroy();
                    this.triggerTimeout = undefined;
                }, 2000);
            } else {
                const newJob = this.scheduleJob(trigger.getDate(), () => {
                    this.logger.logDebug(`Executing trigger ${trigger}`);
                    trigger.getAction().execute(trigger.getData());
                });
                this.registered.push([trigger, newJob]);
            }
        }
    }

    /**
     * @param trigger OneTimeTrigger
     */
    public unregister(trigger: OneTimeTrigger): void {
        this.logger.logDebug(`Unregister OneTimeTriggerScheduler trigger ${trigger}`);
        const job = this.getAssociatedJob(trigger);
        if (job) {
            this.logger.logDebug(`Unregister OneTimeTriggerScheduler trigger ${trigger}`);
            this.cancelJob(job);
            this.removeTrigger(trigger);
        } else {
            this.logger.logDebug(`Error Unregister OneTimeTriggerScheduler trigger ${trigger}`);
        }
    }

    /**
     * loadregister
     */
    public loadregister(): void {
        for (const r of this.registered) {
            this.logger.logDebug(`Check OneTimeTriggerScheduler ${r[0]}`);
        }
    }

    /**
     * destroy
     */
    public destroy(): void {
        this.triggerTimeout && this.adapter.clearTimeout(this.triggerTimeout);
        this.registered.forEach(r => this.unregister(r[0]));
    }

    private getAssociatedJob(trigger: OneTimeTrigger): Job | null {
        const entry = this.registered.find(r => r[0] === trigger);
        if (entry) {
            return entry[1];
        }
        this.loadregister();
        return null;
    }

    private removeTrigger(trigger: OneTimeTrigger): void {
        this.registered = this.registered.filter(r => r[0] !== trigger);
    }
}
