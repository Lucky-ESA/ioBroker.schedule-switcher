import { TimeTrigger } from "../triggers/TimeTrigger";
import { TimeTriggerBuilder } from "../triggers/TimeTriggerBuilder";
import type { Action } from "../types/Action";
import type { Serializer } from "../types/Serializer";
import type { Trigger } from "../types/Trigger";
import type { UniversalSerializer } from "./UniversalSerializer";

/**
 * TimeTriggerSerializer
 */
export class TimeTriggerSerializer implements Serializer<Trigger> {
    /**
     * @param actionSerializer UniversalSerializer
     */
    constructor(private readonly actionSerializer: UniversalSerializer<Action>) {}

    /**
     * @param stringToDeserialize Trigger
     */
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
            .setValueCheck(json.valueCheck)
            .setWeekdays(json.weekdays)
            .setTodayTrigger(json.todayTrigger)
            .setId(json.id)
            .build();
    }

    /**
     * @param objectToSerialize Trigger
     */
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
                valueCheck: objectToSerialize.getValueCheck(),
                weekdays: objectToSerialize.getWeekdays(),
                id: objectToSerialize.getId(),
                action: JSON.parse(this.actionSerializer.serialize(objectToSerialize.getAction())),
                todayTrigger: objectToSerialize.getTodayTrigger(),
            });
        }
        throw new Error("objectToSerialize must be of type TimeTrigger.");
    }

    /**
     * getType
     */
    getType(): string {
        return TimeTrigger.prototype.constructor.name;
    }
}
