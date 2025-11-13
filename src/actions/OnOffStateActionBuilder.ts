import type { StateService } from "../types/StateService";
import { BaseStateActionBuilder } from "./BaseStateActionBuilder";
import { OnOffStateAction } from "./OnOffStateAction";

/**
 * OnOffStateActionBuilder
 */
export class OnOffStateActionBuilder<T extends string | number | boolean> extends BaseStateActionBuilder {
    private idsOfStatesToSet: string[] = [];
    private onValue: T | null = null;
    private offValue: T | null = null;
    private booleanValue = true;
    private valueType: string = "";

    /**
     * @param idsOfStatesToSet States
     * @returns this
     */
    public setIdsOfStatesToSet(idsOfStatesToSet: string[]): OnOffStateActionBuilder<T> {
        this.idsOfStatesToSet = idsOfStatesToSet;
        return this;
    }

    /**
     * @param onValue on
     * @returns this
     */
    public setOnValue(onValue: T): OnOffStateActionBuilder<T> {
        this.onValue = onValue;
        return this;
    }

    /**
     * @param offValue off
     * @returns this
     */
    public setOffValue(offValue: T): OnOffStateActionBuilder<T> {
        this.offValue = offValue;
        return this;
    }

    /**
     * @param booleanValue value
     * @returns this
     */
    public setBooleanValue(booleanValue: boolean): OnOffStateActionBuilder<T> {
        this.booleanValue = booleanValue;
        return this;
    }

    /**
     * @param valueType set type
     * @returns this
     */
    public setValueType(valueType: string): OnOffStateActionBuilder<T> {
        this.valueType = valueType;
        return this;
    }

    /**
     * @param stateService setState
     * @returns this
     */
    public setStateService(stateService: StateService): OnOffStateActionBuilder<T> {
        super.setStateService(stateService);
        return this;
    }

    /**
     * OnOffStateAction
     *
     * @returns OnOffStateAction
     */
    public build(): OnOffStateAction<T> {
        return new OnOffStateAction<T>(
            this.idsOfStatesToSet,
            this.onValue as T,
            this.offValue as T,
            this.booleanValue,
            this.stateService as StateService,
            this.valueType,
        );
    }
}
