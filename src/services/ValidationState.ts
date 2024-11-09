export interface validationState {
    validation(id: string, val: any, check: boolean): Promise<any>;
    validationView(utils: string): Promise<any>;
    setNextTime(coordinate: any): Promise<any>;
    setActionTime(coordinate: any): Promise<any>;
}
