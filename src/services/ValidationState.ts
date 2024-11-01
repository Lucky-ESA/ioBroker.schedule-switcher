export interface validationState {
    validation(id: string, val: any, check: boolean): Promise<any>;
    validationView(utils: string): Promise<any>;
}
