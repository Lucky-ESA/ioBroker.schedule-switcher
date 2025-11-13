"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var UniversalSerializer_exports = {};
__export(UniversalSerializer_exports, {
  UniversalSerializer: () => UniversalSerializer
});
module.exports = __toCommonJS(UniversalSerializer_exports);
class UniversalSerializer {
  /**
   * @param serializers Serializer
   * @param logger LoggingService
   */
  constructor(serializers, logger) {
    this.serializers = serializers;
    this.logger = logger;
    this.logger = logger;
  }
  /**
   * UseSerializer
   *
   * @param serializer Serializer
   */
  useSerializer(serializer) {
    if (serializer == null) {
      throw new Error("Serializer to use may not be null/undefined");
    }
    this.serializers = this.serializers.filter((s) => s.getType() !== serializer.getType());
    this.serializers.push(serializer);
  }
  /**
   * Deserialize
   *
   * @param stringToDeserialize Deserialize
   * @returns action or crash adapter
   */
  deserialize(stringToDeserialize) {
    const json = JSON.parse(stringToDeserialize);
    const serializer = this.serializers.find((s) => s.getType() === json.type);
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
  serialize(object) {
    this.logger.logDebug(`object.constructor.name: ${object.constructor.name}`);
    const serializer = this.serializers.find((s) => s.getType() === object.constructor.name);
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
  getType() {
    return "Universal";
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UniversalSerializer
});
//# sourceMappingURL=UniversalSerializer.js.map
