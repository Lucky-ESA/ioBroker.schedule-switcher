import type { LoggingService } from "../services/LoggingService";
import type { Trigger } from "../triggers/Trigger";
import { TriggerScheduler } from "./TriggerScheduler";

/**
 * UniversalTriggerScheduler
 */
export class UniversalTriggerScheduler extends TriggerScheduler {
    private readonly schedulers: TriggerScheduler[];
    /**
     * @param schedulers TriggerScheduler
     * @param logger Log service
     */
    constructor(
        schedulers: TriggerScheduler[],
        private readonly logger: LoggingService,
    ) {
        super();
        this.schedulers = schedulers;
    }

    /**
     * @param trigger Trigger
     */
    public register(trigger: Trigger): void {
        const scheduler = this.schedulers.find(s => s.forType() === trigger.constructor.name);
        if (scheduler) {
            return scheduler.register(trigger);
        }
        throw new Error(`Register - No scheduler for trigger of type ${trigger.constructor.name} found`);
    }

    /**
     * @param trigger Trigger
     */
    public unregister(trigger: Trigger): void {
        const scheduler = this.schedulers.find(s => s.forType() === trigger.constructor.name);
        if (scheduler) {
            return scheduler.unregister(trigger);
        }
        throw new Error(`Unregister - No scheduler for trigger of type ${trigger.constructor.name} found`);
    }

    /**
     * loadregister
     */
    public loadregister(): void {
        for (const r of this.schedulers) {
            this.logger.logDebug(`Start UniversalTriggerScheduler`);
            r.loadregister();
        }
    }

    /**
     * destroy
     */
    public destroy(): void {
        this.schedulers.forEach(s => s.destroy());
    }

    /**
     * forType
     */
    public forType(): string {
        return "Universal";
    }
}
