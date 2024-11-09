import { LoggingService } from "../services/LoggingService";
import { Trigger } from "../triggers/Trigger";
import { TriggerScheduler } from "./TriggerScheduler";

export class UniversalTriggerScheduler extends TriggerScheduler {
    private readonly schedulers: TriggerScheduler[];
    constructor(
        schedulers: TriggerScheduler[],
        private readonly logger: LoggingService,
    ) {
        super();
        this.schedulers = schedulers;
    }

    public register(trigger: Trigger): void {
        const scheduler = this.schedulers.find((s) => s.forType() === trigger.constructor.name);
        if (scheduler) {
            return scheduler.register(trigger);
        } else {
            throw new Error(`No scheduler for trigger of type ${trigger.constructor.name} found`);
        }
    }

    public unregister(trigger: Trigger): void {
        const scheduler = this.schedulers.find((s) => s.forType() === trigger.constructor.name);
        if (scheduler) {
            return scheduler.unregister(trigger);
        } else {
            throw new Error(`No scheduler for trigger of type ${trigger.constructor.name} found`);
        }
    }

    public loadregister(): void {
        for (const r of this.schedulers) {
            this.logger.logDebug(`Start UniversalTriggerScheduler`);
            r.loadregister();
        }
    }

    public destroy(): void {
        this.schedulers.forEach((s) => s.destroy());
    }

    public forType(): string {
        return "Universal";
    }
}
