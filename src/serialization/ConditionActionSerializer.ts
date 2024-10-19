import { Action } from "../actions/Action";
import { ConditionAction } from "../actions/ConditionAction";
import { Condition } from "../actions/conditions/Condition";
import { Serializer } from "./Serializer";
import { UniversalSerializer } from "./UniversalSerializer";

export class ConditionActionSerializer implements Serializer<Action> {
    constructor(
        private conditionSerializer: UniversalSerializer<Condition>,
        private actionSerializer: UniversalSerializer<Action>,
        private adapter: ioBroker.Adapter,
    ) {}

    deserialize(stringToDeserialize: string): Action {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== this.getType()) {
            this.adapter.log.error(`Can not deserialize object of type ${json.type}`);
        }
        return new ConditionAction(
            this.conditionSerializer.deserialize(JSON.stringify(json.condition)),
            this.actionSerializer.deserialize(JSON.stringify(json.action)),
            this.adapter,
        );
    }

    serialize(objectToSerialize: Action): string {
        if (objectToSerialize == null) {
            this.adapter.log.error("objectToSerialize may not be null or undefined.");
            return JSON.stringify({});
        }
        if (objectToSerialize instanceof ConditionAction) {
            return JSON.stringify({
                type: this.getType(),
                condition: JSON.parse(this.conditionSerializer.serialize(objectToSerialize.getCondition())),
                action: JSON.parse(this.actionSerializer.serialize(objectToSerialize.getAction())),
            });
        } else {
            this.adapter.log.error("objectToSerialize must be of type ConditionAction.");
            return JSON.stringify({});
        }
    }

    public getType(): string {
        return ConditionAction.prototype.constructor.name;
    }
}
