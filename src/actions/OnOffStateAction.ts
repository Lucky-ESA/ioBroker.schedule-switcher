import { StateService } from "../services/StateService";
import { BaseStateAction } from "./BaseStateAction";

export class OnOffStateAction<T extends string | number | boolean> extends BaseStateAction {
    private idsOfStatesToSet: string[];
    private readonly onValue: T;
    private readonly offValue: T;
    private readonly booleanValue: boolean;
    private readonly valueType: string;

    constructor(
        idsOfStatesToSet: string[],
        onValue: T,
        offValue: T,
        booleanValue: boolean,
        stateService: StateService,
        valueType: string,
    ) {
        super(stateService);

        this.checkIdsOfStates(idsOfStatesToSet);
        if (onValue == undefined) {
            throw new Error("OnValue may not be undefined.");
        }
        if (offValue == undefined) {
            throw new Error("OffValue may not be undefined.");
        }
        if (booleanValue == null) {
            throw new Error("ValueToSet may not be null or undefined.");
        }

        this.idsOfStatesToSet = idsOfStatesToSet;
        this.onValue = onValue;
        this.offValue = offValue;
        this.booleanValue = booleanValue;
        this.valueType = valueType;
    }

    public getIdsOfStatesToSet(): string[] {
        return this.idsOfStatesToSet;
    }

    public setIdsOfStatesToSet(idsOfStatesToSet: string[]): void {
        this.checkIdsOfStates(idsOfStatesToSet);
        this.idsOfStatesToSet = idsOfStatesToSet;
    }

    public getOnValue(): T {
        return this.onValue;
    }

    public getOffValue(): T {
        return this.offValue;
    }

    public getBooleanValue(): boolean {
        return this.booleanValue;
    }

    public getValueType(): string {
        return this.valueType;
    }

    public execute(trigger: any): void {
        const valueToUse = this.getBooleanValue() ? this.getOnValue() : this.getOffValue();
        this.getIdsOfStatesToSet().forEach((id) => {
            this.getStateService().setForeignState(id, valueToUse, trigger);
        });
    }

    public toBooleanValueType(): OnOffStateAction<boolean> {
        return new OnOffStateAction(
            this.getIdsOfStatesToSet(),
            true,
            false,
            this.getBooleanValue(),
            this.getStateService(),
            this.getValueType(),
        );
    }

    public toStringValueType(onValue: string, offValue: string): OnOffStateAction<string> {
        return new OnOffStateAction(
            this.getIdsOfStatesToSet(),
            onValue,
            offValue,
            this.getBooleanValue(),
            this.getStateService(),
            this.getValueType(),
        );
    }

    public toNumberValueType(onValue: number, offValue: number): OnOffStateAction<number> {
        return new OnOffStateAction(
            this.getIdsOfStatesToSet(),
            onValue,
            offValue,
            this.getBooleanValue(),
            this.getStateService(),
            this.getValueType(),
        );
    }

    private checkIdsOfStates(ids: string[]): void {
        if (ids == null || ids.length == 0 || ids.includes("")) {
            throw new Error("IdsOfStatesToSet may not be null or empty.");
        }
    }
}
