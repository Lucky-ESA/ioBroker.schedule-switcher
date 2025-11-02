import type { AllTriggers } from "./AllTrigger";
/**
 * Action
 */
export interface Action {
    /**
     * execute
     */
    execute(trigger: AllTriggers): void;
}
