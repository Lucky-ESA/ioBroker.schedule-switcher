import type { AllTriggers } from "../types/AllTrigger";

/**
 * validation
 */
export interface ValidationState {
    /**
     * validation
     */
    validation(id: string, val: any, check: boolean): Promise<any>;
    /**
     * view
     */
    validationView(utils: string): Promise<void>;
    /**
     * Time
     */
    setNextAstroTime(check: boolean): Promise<void>;
    /**
     * Coodinates
     */
    setActionTime(): Promise<void>;
    /**
     * Next switch time
     */
    nextDateSwitch(now: Date, trigger: AllTriggers): Promise<string>;
}
