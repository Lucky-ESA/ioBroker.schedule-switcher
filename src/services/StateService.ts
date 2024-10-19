export interface StateService {
    setState(id: string, value: string | number | boolean): void;
    getState(id: string): Promise<any>;
    setForeignState(id: string, value: string | number | boolean): void;
    getForeignState(id: string): Promise<any>;
    extendObject(id: string, value: any): Promise<any>;
}
