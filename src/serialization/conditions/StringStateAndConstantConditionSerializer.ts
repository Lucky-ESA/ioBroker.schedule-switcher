import { StringStateAndConstantCondition } from "../../actions/conditions/StringStateAndConstantCondition";
import type { Condition } from "../../types/Condition";
import { EqualitySign } from "../../types/EqualitySign";
import type { Serializer } from "../../types/Serializer";
import type { StateService } from "../../types/StateService";

/**
 * StringStateAndConstantConditionSerializer
 */
export class StringStateAndConstantConditionSerializer implements Serializer<Condition> {
    /**
     * @param stateService StateService
     */
    constructor(private stateService: StateService) {}

    /**
     * @param stringToDeserialize Condition
     */
    deserialize(stringToDeserialize: string): Condition {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== this.getType()) {
            throw new Error(`Can not deserialize object of type ${json.type}`);
        }
        if (!Object.values(EqualitySign).includes(json.sign)) {
            throw new Error(`Equality sign ${json.sign} unknown`);
        }
        return new StringStateAndConstantCondition(json.constant, json.stateId, json.sign, this.stateService);
    }

    /**
     * @param objectToSerialize Condition
     */
    serialize(objectToSerialize: Condition): string {
        if (objectToSerialize == null) {
            throw new Error("objectToSerialize may not be null or undefined.");
        }
        if (objectToSerialize instanceof StringStateAndConstantCondition) {
            return JSON.stringify({
                type: this.getType(),
                constant: objectToSerialize.getConstant(),
                stateId: objectToSerialize.getStateId(),
                sign: objectToSerialize.getSign(),
            });
        }
        throw new Error("objectToSerialize must be of type StringStateAndConstantCondition .");
    }

    /**
     * @returns name
     */
    getType(): string {
        return StringStateAndConstantCondition.prototype.constructor.name;
    }
}
