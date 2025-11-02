/**
 * StateService
 */
export interface StateService {
    /**
     * setState
     */
    setState(id: string, value: string | number | boolean): Promise<any>;
    /**
     * getState
     */
    getState(id: string): Promise<any>;
    /**
     * setForeinState
     */
    setForeignState(id: string, value: string | number | boolean, trigger: any): void;
    /**
     * getForeinState
     */
    getForeignState(id: string): Promise<any>;
    /**
     * extendObject
     */
    extendObject(id: string, value: any): Promise<any>;
}
