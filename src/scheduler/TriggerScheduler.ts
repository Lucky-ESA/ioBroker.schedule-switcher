import { Destroyable } from "../Destroyable";
import { Trigger } from "../triggers/Trigger";

export abstract class TriggerScheduler implements Destroyable {
    abstract register(trigger: Trigger): void;

    abstract unregister(trigger: Trigger): void;

    abstract forType(): string;

    abstract destroy(): void;

    abstract loadregister(): void;
}
