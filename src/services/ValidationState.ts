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
    validationView(utils: string): Promise<any>;
    /**
     * Time
     */
    setNextTime(coordinate: any): Promise<any>;
    /**
     * Coodinates
     */
    setActionTime(coordinate: any): Promise<any>;
}
