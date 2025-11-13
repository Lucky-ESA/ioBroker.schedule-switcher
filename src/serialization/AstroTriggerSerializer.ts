import { AstroTrigger } from "../triggers/AstroTrigger";
import { AstroTriggerBuilder } from "../triggers/AstroTriggerBuilder";
import type { Action } from "../types/Action";
import type { Serializer } from "../types/Serializer";
import type { Trigger } from "../types/Trigger";
import type { UniversalSerializer } from "./UniversalSerializer";

/**
 * AstroTriggerSerializer
 */
export class AstroTriggerSerializer implements Serializer<Trigger> {
    /**
     * @param actionSerializer UniversalSerializer
     */
    constructor(private readonly actionSerializer: UniversalSerializer<Action>) {}

    /**
     * Deserialize
     *
     * @param stringToDeserialize Trigger
     * @returns AstroTrigger
     */
    public deserialize(stringToDeserialize: string): Trigger {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== this.getType()) {
            throw new Error(`Can not deserialize object of type ${json.type}`);
        }
        return new AstroTriggerBuilder()
            .setAction(this.actionSerializer.deserialize(JSON.stringify(json.action)))
            .setAstroTime(json.astroTime)
            .setShift(json.shiftInMinutes)
            .setObjectId(json.objectId)
            .setValueCheck(json.valueCheck)
            .setTodayTrigger(json.todayTrigger)
            .setWeekdays(json.weekdays)
            .setId(json.id)
            .build();
    }

    /**
     * Serialize
     *
     * @param objectToSerialize Trigger
     * @returns astro trigger or crash adapter
     */
    public serialize(objectToSerialize: Trigger): string {
        if (objectToSerialize == null) {
            throw new Error("objectToSerialize may not be null or undefined.");
        }
        if (objectToSerialize instanceof AstroTrigger) {
            return JSON.stringify({
                type: this.getType(),
                astroTime: objectToSerialize.getAstroTime(),
                shiftInMinutes: objectToSerialize.getShiftInMinutes(),
                weekdays: objectToSerialize.getWeekdays(),
                objectId: objectToSerialize.getObjectId(),
                valueCheck: objectToSerialize.getValueCheck(),
                id: objectToSerialize.getId(),
                action: JSON.parse(this.actionSerializer.serialize(objectToSerialize.getAction())),
                todayTrigger: objectToSerialize.getTodayTrigger(),
            });
        }
        throw new Error("objectToSerialize must be of type AstroTrigger.");
    }

    /**
     * getType
     *
     * @returns action on/off
     */
    getType(): string {
        return AstroTrigger.prototype.constructor.name;
    }
}
