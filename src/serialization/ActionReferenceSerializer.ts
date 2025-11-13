import type { Action } from "../types/Action";
import type { LoggingService } from "../types/LoggingService";
import type { Serializer } from "../types/Serializer";

/**
 * ActionReferenceSerializer
 */
export class ActionReferenceSerializer implements Serializer<Action> {
    private readonly referencableActions: Map<string, Action>;
    private readonly typeToReference: string;
    /**
     *
     * @param typeToReference Reference
     * @param referencableActions Actions
     * @param logger Logs
     */
    constructor(
        typeToReference: string,
        referencableActions: Map<string, Action>,
        private logger: LoggingService,
    ) {
        this.typeToReference = typeToReference;
        this.referencableActions = referencableActions;
        this.logger = logger;
    }

    /**
     * Deserialize
     *
     * @param stringToDeserialize Action
     * @returns action or crash adapter
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
     * Serialize
     *
     * @param objectToSerialize Action
     * @returns action or crash adapter
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
        this.logger.logDebug(`Name: ${name}`);
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
     *
     * @returns reference
     */
    getType(): string {
        return this.typeToReference;
    }
}
