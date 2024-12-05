import type { Action } from "../actions/Action";
import type { Serializer } from "./Serializer";

/**
 * ActionReferenceSerializer
 */
export class ActionReferenceSerializer implements Serializer<Action> {
    private readonly referencableActions: Map<string, Action>;
    private readonly typeToReference: string;
    private readonly adapter: ioBroker.Adapter;
    /**
     *
     * @param typeToReference Reference
     * @param referencableActions Actions
     * @param adapter ioBroker
     */
    constructor(typeToReference: string, referencableActions: Map<string, Action>, adapter: ioBroker.Adapter) {
        this.typeToReference = typeToReference;
        this.referencableActions = referencableActions;
        this.adapter = adapter;
    }

    /**
     * @param stringToDeserialize Action
     */
    deserialize(stringToDeserialize: string): Action {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== this.getType()) {
            throw new Error(`Can not reference object of type ${json.type}`);
        }
        const found = this.referencableActions.get(json.name);
        if (found) {
            return found;
        }
        throw new Error(`No existing action found with name ${json.name} to reference`);
    }

    /**
     * @param objectToSerialize Action
     */
    serialize(objectToSerialize: Action): string {
        if (objectToSerialize == null) {
            throw new Error("objectToSerialize may not be null or undefined.");
        }
        let name = null;
        for (const entry of this.referencableActions.entries()) {
            if (entry[1] === objectToSerialize) {
                name = entry[0];
                break;
            }
        }
        this.adapter.log.debug(`Name: ${name}`);
        if (name) {
            return JSON.stringify({
                type: this.getType(),
                name: name,
            });
        }
        throw new Error("no existing action found");
    }

    /**
     * getType
     */
    getType(): string {
        return this.typeToReference;
    }
}
