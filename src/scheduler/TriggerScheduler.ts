import type { Destroyable } from "../Destroyable";
import type { Trigger } from "../triggers/Trigger";

/**
 * TriggerScheduler
 */
export abstract class TriggerScheduler implements Destroyable {
    abstract register(trigger: Trigger): void;
    abstract unregister(trigger: Trigger): void;
    abstract forType(): string;
    abstract destroy(): void;
    abstract loadregister(): void;
}
