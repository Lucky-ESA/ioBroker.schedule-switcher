import { LoggingService } from "../services/LoggingService";
import { Serializer } from "./Serializer";

export class UniversalSerializer<T extends Record<string, any>> implements Serializer<T> {
    constructor(
        private serializers: Serializer<T>[],
        private logger: LoggingService,
    ) {
        this.logger = logger;
    }

    public useSerializer(serializer: Serializer<T>): void {
        if (serializer == null) {
            throw new Error("Serializer to use may not be null/undefined");
        }
        this.serializers = this.serializers.filter((s) => s.getType() !== serializer.getType());
        this.serializers.push(serializer);
    }

    public serialize(object: T): string {
        this.logger.logDebug(`object.constructor.name: ${object.constructor.name}`);
        const serializer = this.serializers.find((s) => s.getType() === object.constructor.name);
        if (serializer) {
            return serializer.serialize(object);
        } else {
            throw new Error(`No serializer for object of type ${object.constructor.name} found`);
        }
    }

    public deserialize(stringToDeserialize: string): T {
        const json = JSON.parse(stringToDeserialize);
        const serializer = this.serializers.find((s) => s.getType() === json.type);
        if (serializer) {
            return serializer.deserialize(stringToDeserialize);
        } else {
            throw new Error(`No serializer for object of type ${json.type} found`);
        }
    }

    getType(): string {
        return "Universal";
    }
}
