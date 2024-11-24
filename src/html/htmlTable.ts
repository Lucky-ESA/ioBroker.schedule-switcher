export interface htmltable {
    changeHTML(id: string, val: ioBroker.State | null | undefined): void;
    changeTrigger(id: string, val: ioBroker.State | null | undefined | string): Promise<void>;
    changeEnabled(id: string, val: ioBroker.State | null | undefined | boolean): void;
    createStates(lang: string): Promise<any>;
    updateHTML(): void;
}
