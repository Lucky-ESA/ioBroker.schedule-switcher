import type { Destroyable } from "../types/Destroyable";
import type { Trigger } from "../types/Trigger";

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
