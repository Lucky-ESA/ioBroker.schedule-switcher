import { Action } from "../actions/Action";
import { AstroTrigger } from "../triggers/AstroTrigger";
import { AstroTriggerBuilder } from "../triggers/AstroTriggerBuilder";
import { Trigger } from "../triggers/Trigger";
import { Serializer } from "./Serializer";
import { UniversalSerializer } from "./UniversalSerializer";

export class AstroTriggerSerializer implements Serializer<Trigger> {
    constructor(private readonly actionSerializer: UniversalSerializer<Action>) {}

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
            .setTodayTrigger(json.todayTrigger)
            .setWeekdays(json.weekdays)
            .setId(json.id)
            .build();
    }

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
                id: objectToSerialize.getId(),
                action: JSON.parse(this.actionSerializer.serialize(objectToSerialize.getAction())),
                todayTrigger: objectToSerialize.getTodayTrigger(),
            });
        } else {
            throw new Error("objectToSerialize must be of type AstroTrigger.");
        }
    }
    getType(): string {
        return AstroTrigger.prototype.constructor.name;
    }
}
