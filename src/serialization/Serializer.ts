/**
 * Serializer
 */
export interface Serializer<T> {
    /**
     * getType
     */
    getType(): string;

    /**
     * deserialize
     */
    deserialize(stringToDeserialize: string): T;

    /**
     * serialize
     */
    serialize(objectToSerialize: T): string;
}
