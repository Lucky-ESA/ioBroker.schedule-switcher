/**
 * htmltable
 */
export interface htmltable {
    /**
     * changeHTML
     */
    changeHTML(id: string, val: ioBroker.State | null | undefined): void;
    /**
     * changeTrigger
     */
    changeTrigger(id: string, val: ioBroker.State | null | undefined | string): Promise<void>;
    /**
     * changeEnabled
     */
    changeEnabled(id: string, val: ioBroker.State | null | undefined | boolean): void;
    /**
     * createStates
     */
    createStates(lang: string): Promise<any>;
    /**
     * updateHTML
     */
    updateHTML(): void;
}
/**
 * NextActionName
 */
export interface NextActionName {
    /**
     * getDate
     */
    getDate: number;
    /**
     * date
     */
    date: Date;
    /**
     * action
     */
    action: string;
}
