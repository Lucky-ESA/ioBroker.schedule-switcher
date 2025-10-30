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
    setNextTime(check: boolean): Promise<void>;
    /**
     * Coodinates
     */
    setActionTime(): Promise<void>;
}
