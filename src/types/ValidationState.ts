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
     * Time
     */
    setNextAstroTime(check: boolean): Promise<void>;
    /**
     * Next switch time
     */
    setActionTime(): Promise<void>;
    /**
     * Next switch time
     */
    nextDateSwitch(now: Date, trigger: AllTriggers): Promise<string>;
}
