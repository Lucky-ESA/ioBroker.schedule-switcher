import type { UniversalTriggerScheduler } from "../scheduler/UniversalTriggerScheduler";
import type { Destroyable } from "../types/Destroyable";
import type { LoggingService } from "../types/LoggingService";
import type { Trigger } from "../types/Trigger";

/**
 * Schedule
 */
export abstract class Schedule implements Destroyable {
    private enabled = false;
    private name = "New Schedule";
    private triggers: Trigger[] = [];
    private readonly triggerScheduler: UniversalTriggerScheduler;
    private logger: LoggingService;

    protected constructor(triggerScheduler: UniversalTriggerScheduler, logger: LoggingService) {
        if (triggerScheduler == null) {
            throw new Error(`triggerScheduler may not be null or undefined`);
        }
        this.triggerScheduler = triggerScheduler;
        this.logger = logger;
    }

    /**
     * @param enabled enabled
     */
    public setEnabled(enabled: boolean): void {
        if (enabled !== this.enabled) {
            if (enabled) {
                this.getTriggers().forEach(t => this.triggerScheduler.register(t));
            } else {
                this.triggerScheduler.destroy();
            }
            this.enabled = enabled;
        }
    }

    /**
     * @param name change name
     */
    public setName(name: string): void {
        if (name == null) {
            this.logger.logWarn(`name may not be null or undefined`);
            name = "Unknown";
        }
        this.name = name;
    }

    /**
     * isEnabled
     *
     * @returns status
     */
    public isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * getName
     *
     * @returns namr
     */
    public getName(): string {
        return this.name;
    }

    /**
     * getTriggers
     *
     * @returns trigger
     */
    public getTriggers(): Trigger[] {
        return this.triggers;
    }

    /**
     * @param trigger Trigger
     */
    public addTrigger(trigger: Trigger): void {
        if (this.findTriggerById(trigger.getId())) {
            this.logger.logWarn(`Cannot add trigger, trigger id ${trigger.getId()} exists already`);
        } else {
            this.triggers.push(trigger);
            if (this.isEnabled()) {
                this.triggerScheduler.register(trigger);
            }
        }
    }

    /**
     * loadregister
     */
    public loadregister(): void {
        for (const r of this.triggers) {
            this.logger.logDebug(`Schedule ${r}`);
        }
        this.triggerScheduler.loadregister();
    }

    /**
     * @param trigger Trigger
     */
    public updateTrigger(trigger: Trigger): void {
        const index = this.getTriggers().findIndex(t => t.getId() === trigger.getId());
        if (index == -1) {
            this.logger.logWarn(`Cannot update trigger, trigger id ${trigger.getId()} not found`);
        } else {
            if (this.isEnabled()) {
                this.triggerScheduler.unregister(this.getTriggers()[index]);
                this.triggerScheduler.register(trigger);
            }
            this.triggers[index] = trigger;
        }
    }

    /**
     * @param triggerId ID
     */
    public removeTrigger(triggerId: string): void {
        const trigger = this.triggers.find(t => t.getId() === triggerId);
        if (trigger) {
            this.removeTriggerAndUnregister(trigger);
        } else {
            this.logger.logInfo(`Cannot delete trigger, trigger id ${triggerId} not found`);
        }
    }

    /**
     * destroy
     */
    public destroy(): void {
        if (this.isEnabled()) {
            this.triggerScheduler.destroy();
        }
        this.triggers = [];
    }

    /**
     * @param trigger Trigger
     */
    private removeTriggerAndUnregister(trigger: Trigger): void {
        if (this.isEnabled()) {
            this.triggerScheduler.unregister(trigger);
        }
        this.triggers = this.triggers.filter(t => t.getId() !== trigger.getId());
    }

    /**
     * @param id id Trigger
     * @returns trigger
     */
    private findTriggerById(id: string): Trigger | undefined {
        return this.getTriggers().find(t => t.getId() === id);
    }
}
