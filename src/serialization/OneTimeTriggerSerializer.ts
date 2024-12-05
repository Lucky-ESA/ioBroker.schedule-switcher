import type { Action } from "../actions/Action";
import { OneTimeTrigger } from "../triggers/OneTimeTrigger";
import { OneTimeTriggerBuilder } from "../triggers/OneTimeTriggerBuilder";
import type { Trigger } from "../triggers/Trigger";
import type { Serializer } from "./Serializer";
import type { UniversalSerializer } from "./UniversalSerializer";

/**
 * OneTimeTriggerSerializer
 */
export class OneTimeTriggerSerializer implements Serializer<Trigger> {
    /**
     * @param actionSerializer Serializer
     * @param deleteTrigger Trigger
     */
    constructor(
        private readonly actionSerializer: UniversalSerializer<Action>,
        private readonly deleteTrigger?: (triggerId: string) => void,
    ) {}

    /**
     * @param stringToDeserialize Deserialize
     */
    public deserialize(stringToDeserialize: string): Trigger {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== this.getType()) {
            throw new Error(`Can not deserialize object of type ${json.type}`);
        }
        return new OneTimeTriggerBuilder()
            .setAction(this.actionSerializer.deserialize(JSON.stringify(json.action)))
            .setDate(new Date(Date.parse(json.date)))
            .setObjectId(json.objectId)
            .setTimeDate(json.timedate)
            .setId(json.id)
            .setOnDestroy(() => {
                if (this.deleteTrigger) {
                    this.deleteTrigger(json.id);
                }
            })
            .build();
    }

    /**
     * @param objectToSerialize Serialize
     */
    public serialize(objectToSerialize: Trigger): string {
        if (objectToSerialize == null) {
            throw new Error("objectToSerialize may not be null or undefined.");
        }
        if (objectToSerialize instanceof OneTimeTrigger) {
            return JSON.stringify({
                type: this.getType(),
                date: objectToSerialize.getDate().toISOString(),
                objectId: objectToSerialize.getObjectId(),
                timedate: objectToSerialize.getTimeDate(),
                id: objectToSerialize.getId(),
                action: JSON.parse(this.actionSerializer.serialize(objectToSerialize.getInternalAction())),
            });
        }
        throw new Error("objectToSerialize must be of type OneTimeTrigger.");
    }

    /**
     * getType
     */
    getType(): string {
        return OneTimeTrigger.prototype.constructor.name;
    }
}
