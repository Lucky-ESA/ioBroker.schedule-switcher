import type { Action } from "../actions/Action";

/**
 * Trigger
 */
export interface Trigger {
    /**
     * getAction
     */
    getAction(): Action;
    /**
     * setAction
     */
    setAction(action: Action): void;
    /**
     * getId
     */
    getId(): string;
}
