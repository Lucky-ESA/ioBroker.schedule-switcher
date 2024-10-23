import { Action } from "../actions/Action";
import { TimeTrigger } from "../triggers/TimeTrigger";
import { TimeTriggerBuilder } from "../triggers/TimeTriggerBuilder";
import { Trigger } from "../triggers/Trigger";
import { Serializer } from "./Serializer";
import { UniversalSerializer } from "./UniversalSerializer";

export class TimeTriggerSerializer implements Serializer<Trigger> {
    constructor(private readonly actionSerializer: UniversalSerializer<Action>) {}

    public deserialize(stringToDeserialize: string): Trigger {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== this.getType()) {
            throw new Error(`Can not deserialize object of type ${json.type}`);
        }
        return new TimeTriggerBuilder()
            .setAction(this.actionSerializer.deserialize(JSON.stringify(json.action)))
            .setHour(json.hour)
            .setMinute(json.minute)
            .setObjectId(json.objectId)
            .setWeekdays(json.weekdays)
            .setNextTrigger(json.nextTrigger)
            .setId(json.id)
            .build();
    }

    public serialize(objectToSerialize: Trigger): string {
        if (objectToSerialize == null) {
            throw new Error("objectToSerialize may not be null or undefined.");
        }
        if (objectToSerialize instanceof TimeTrigger) {
            return JSON.stringify({
                type: this.getType(),
                hour: objectToSerialize.getHour(),
                minute: objectToSerialize.getMinute(),
                objectId: objectToSerialize.getObjectId(),
                weekdays: objectToSerialize.getWeekdays(),
                id: objectToSerialize.getId(),
                action: JSON.parse(this.actionSerializer.serialize(objectToSerialize.getAction())),
                nextTrigger: objectToSerialize.getNextTrigger(),
            });
        } else {
            throw new Error("objectToSerialize must be of type TimeTrigger.");
        }
    }

    getType(): string {
        return TimeTrigger.prototype.constructor.name;
    }
}
