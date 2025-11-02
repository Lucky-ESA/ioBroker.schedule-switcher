import { ConditionAction } from "../actions/ConditionAction";
import type { Action } from "../types/Action";
import type { Condition } from "../types/Condition";
import type { LoggingService } from "../types/LoggingService";
import type { Serializer } from "../types/Serializer";
import type { UniversalSerializer } from "./UniversalSerializer";

/**
 * ConditionActionSerializer
 */
export class ConditionActionSerializer implements Serializer<Action> {
    /**
     * @param conditionSerializer Serializer
     * @param actionSerializer Action
     * @param logger Logs
     */
    constructor(
        private conditionSerializer: UniversalSerializer<Condition>,
        private actionSerializer: UniversalSerializer<Action>,
        private logger: LoggingService,
    ) {
        this.logger = logger;
    }

    /**
     * @param stringToDeserialize Action
     */
    deserialize(stringToDeserialize: string): Action {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== this.getType()) {
            this.logger.logError(`Can not deserialize object of type ${json.type}`);
        }
        return new ConditionAction(
            this.conditionSerializer.deserialize(JSON.stringify(json.condition)),
            this.actionSerializer.deserialize(JSON.stringify(json.action)),
            this.logger,
        );
    }

    /**
     * @param objectToSerialize Action
     */
    serialize(objectToSerialize: Action): string {
        if (objectToSerialize == null) {
            this.logger.logError("objectToSerialize may not be null or undefined.");
            return JSON.stringify({});
        }
        if (objectToSerialize instanceof ConditionAction) {
            return JSON.stringify({
                type: this.getType(),
                condition: JSON.parse(this.conditionSerializer.serialize(objectToSerialize.getCondition())),
                action: JSON.parse(this.actionSerializer.serialize(objectToSerialize.getAction())),
            });
        }
        this.logger.logError("objectToSerialize must be of type ConditionAction.");
        return JSON.stringify({});
    }

    /**
     * getType
     */
    public getType(): string {
        return ConditionAction.prototype.constructor.name;
    }
}
