import { StateService } from "../services/StateService";
import { BaseStateActionBuilder } from "./BaseStateActionBuilder";
import { OnOffStateAction } from "./OnOffStateAction";

export class OnOffStateActionBuilder<T extends string | number | boolean> extends BaseStateActionBuilder {
    private idsOfStatesToSet: string[] = [];
    private onValue: T | null = null;
    private offValue: T | null = null;
    private booleanValue = true;
    private valueType: string = "";

    public setIdsOfStatesToSet(idsOfStatesToSet: string[]): OnOffStateActionBuilder<T> {
        this.idsOfStatesToSet = idsOfStatesToSet;
        return this;
    }

    public setOnValue(onValue: T): OnOffStateActionBuilder<T> {
        this.onValue = onValue;
        return this;
    }

    public setOffValue(offValue: T): OnOffStateActionBuilder<T> {
        this.offValue = offValue;
        return this;
    }

    public setBooleanValue(booleanValue: boolean): OnOffStateActionBuilder<T> {
        this.booleanValue = booleanValue;
        return this;
    }

    public setValueType(valueType: string): OnOffStateActionBuilder<T> {
        this.valueType = valueType;
        return this;
    }

    public setStateService(stateService: StateService): OnOffStateActionBuilder<T> {
        super.setStateService(stateService);
        return this;
    }

    public build(): OnOffStateAction<T> {
        return new OnOffStateAction<T>(
            this.idsOfStatesToSet,
            this.onValue as any,
            this.offValue as any,
            this.booleanValue,
            this.stateService as any,
            this.valueType as string,
        );
    }
}
