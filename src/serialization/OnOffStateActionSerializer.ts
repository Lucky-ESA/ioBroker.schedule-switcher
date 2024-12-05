import type { Action } from "../actions/Action";
import { OnOffStateAction } from "../actions/OnOffStateAction";
import { OnOffStateActionBuilder } from "../actions/OnOffStateActionBuilder";
import type { StateService } from "../services/StateService";
import type { Serializer } from "./Serializer";

/**
 * OnOffStateActionSerializer
 */
export class OnOffStateActionSerializer implements Serializer<Action> {
    private readonly builder: OnOffStateActionBuilder<string | number | boolean>;

    /**
     * @param stateService setState
     */
    constructor(stateService: StateService) {
        this.builder = new OnOffStateActionBuilder<string | number | boolean>();
        this.builder.setStateService(stateService);
    }

    /**
     * @param stringToDeserialize Action
     */
    deserialize(stringToDeserialize: string): Action {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== this.getType()) {
            throw new Error(`Can not deserialize object of type ${json.type}`);
        }
        if (!this.hasCorrectValueType(json)) {
            throw new Error(`Can not deserialize OnOffStateAction with value type ${json.valueType}`);
        }
        return this.builder
            .setOffValue(json.offValue)
            .setOnValue(json.onValue)
            .setBooleanValue(json.booleanValue)
            .setIdsOfStatesToSet(json.idsOfStatesToSet)
            .setValueType(json.valueType)
            .build();
    }

    /**
     * @param objectToSerialize Action
     */
    serialize(objectToSerialize: Action): string {
        if (objectToSerialize == null) {
            throw new Error("objectToSerialize may not be null or undefined.");
        }
        if (objectToSerialize instanceof OnOffStateAction) {
            return JSON.stringify({
                type: this.getType(),
                valueType: typeof objectToSerialize.getOnValue(),
                onValue: objectToSerialize.getOnValue(),
                offValue: objectToSerialize.getOffValue(),
                booleanValue: objectToSerialize.getBooleanValue(),
                idsOfStatesToSet: objectToSerialize.getIdsOfStatesToSet(),
            });
        }
        throw new Error("objectToSerialize must be of type OnOffStateAction.");
    }

    /**
     * getType
     */
    public getType(): string {
        return OnOffStateAction.prototype.constructor.name;
    }

    private hasCorrectValueType(json: any): boolean {
        return ["string", "number", "boolean"].indexOf(json.valueType) != -1;
    }
}
