export interface htmltable {
    changeHTML(id: string, val: ioBroker.State | null | undefined): void;
    changeTrigger(id: string, val: ioBroker.State | null | undefined): Promise<void>;
    changeTrigger(id: string, val: ioBroker.State | null | undefined): Promise<void>;
    changeEnabled(id: string, val: ioBroker.State | null | undefined): void;
    createStates(lang: string): Promise<any>;
    updateHTML(): void;
}
