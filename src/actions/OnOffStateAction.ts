import type { AllTriggers } from "../types/AllTrigger";
import type { StateService } from "../types/StateService";
import { BaseStateAction } from "./BaseStateAction";

/**
 * OnOffStateAction
 */
export class OnOffStateAction<T extends string | number | boolean> extends BaseStateAction {
    private idsOfStatesToSet: string[];
    private readonly onValue: T;
    private readonly offValue: T;
    private readonly booleanValue: boolean;
    private readonly valueType: string;

    /**
     * @param idsOfStatesToSet States
     * @param onValue on
     * @param offValue off
     * @param booleanValue Value
     * @param stateService State
     * @param valueType Type
     */
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

    /**
     * getIdsOfStatesToSet
     *
     * @returns idsOfStatesToSet
     */
    public getIdsOfStatesToSet(): string[] {
        return this.idsOfStatesToSet;
    }

    /**
     * @param idsOfStatesToSet States
     */
    public setIdsOfStatesToSet(idsOfStatesToSet: string[]): void {
        this.checkIdsOfStates(idsOfStatesToSet);
        this.idsOfStatesToSet = idsOfStatesToSet;
    }

    /**
     * getOnValue
     *
     * @returns onValue
     */
    public getOnValue(): T {
        return this.onValue;
    }

    /**
     * getOffValue
     *
     * @returns offValue
     */
    public getOffValue(): T {
        return this.offValue;
    }

    /**
     * getBooleanValue
     *
     * @returns booleanValue
     */
    public getBooleanValue(): boolean {
        return this.booleanValue;
    }

    /**
     * getValueType
     *
     * @returns valuetype
     */
    public getValueType(): string {
        return this.valueType;
    }

    /**
     * @param trigger Trigger
     */
    public execute(trigger: AllTriggers): void {
        const valueToUse = this.getBooleanValue() ? this.getOnValue() : this.getOffValue();
        this.getIdsOfStatesToSet().forEach(id => {
            this.getStateService().setForeignState(id, valueToUse, trigger);
        });
    }

    /**
     * toBooleanValueType
     *
     * @returns OnOffStateAction
     */
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

    /**
     * @param onValue on
     * @param offValue off
     */
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

    /**
     * @param onValue on
     * @param offValue off
     */
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
