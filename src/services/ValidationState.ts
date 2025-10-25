/**
 * validation
 */
export interface validationState {
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
    setNextTime(coordinate: any): Promise<void>;
    /**
     * Coodinates
     */
    setActionTime(coordinate: any): Promise<void>;
}
