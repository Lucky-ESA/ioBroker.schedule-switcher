import type { LoggingService } from "../types/LoggingService";
import type { Serializer } from "../types/Serializer";

/**
 * UniversalSerializer
 */
export class UniversalSerializer<T extends Record<string, any>> implements Serializer<T> {
    /**
     * @param serializers Serializer
     * @param logger LoggingService
     */
    constructor(
        private serializers: Serializer<T>[],
        private logger: LoggingService,
    ) {
        this.logger = logger;
    }

    /**
     * UseSerializer
     *
     * @param serializer Serializer
     */
    public useSerializer(serializer: Serializer<T>): void {
        if (serializer == null) {
            throw new Error("Serializer to use may not be null/undefined");
        }
        this.serializers = this.serializers.filter(s => s.getType() !== serializer.getType());
        this.serializers.push(serializer);
    }

    /**
     * Deserialize
     *
     * @param stringToDeserialize Deserialize
     * @returns action or crash adapter
     */
    public deserialize(stringToDeserialize: string): T {
        const json = JSON.parse(stringToDeserialize);
        const serializer = this.serializers.find(s => s.getType() === json.type);
        if (serializer) {
            return serializer.deserialize(stringToDeserialize);
        }
        throw new Error(`No serializer for object of type ${json.type} found`);
    }

    /**
     * Serialize
     *
     * @param object constructor
     * @returns action or crash adapter
     */
    public serialize(object: T): string {
        this.logger.logDebug(`object.constructor.name: ${object.constructor.name}`);
        const serializer = this.serializers.find(s => s.getType() === object.constructor.name);
        if (serializer) {
            return serializer.serialize(object);
        }
        throw new Error(`No serializer for object of type ${object.constructor.name} found`);
    }

    /**
     * getType
     *
     * @returns string
     */
    getType(): string {
        return "Universal";
    }
}
