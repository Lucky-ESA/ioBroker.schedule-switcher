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
var ActionReferenceSerializer_exports = {};
__export(ActionReferenceSerializer_exports, {
  ActionReferenceSerializer: () => ActionReferenceSerializer
});
module.exports = __toCommonJS(ActionReferenceSerializer_exports);
class ActionReferenceSerializer {
  /**
   *
   * @param typeToReference Reference
   * @param referencableActions Actions
   * @param logger Logs
   */
  constructor(typeToReference, referencableActions, logger) {
    this.logger = logger;
    this.typeToReference = typeToReference;
    this.referencableActions = referencableActions;
    this.logger = logger;
  }
  referencableActions;
  typeToReference;
  /**
   * @param stringToDeserialize Action
   */
  deserialize(stringToDeserialize) {
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
  serialize(objectToSerialize) {
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
        name
      });
    }
    throw new Error("no existing action found");
  }
  /**
   * getType
   */
  getType() {
    return this.typeToReference;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ActionReferenceSerializer
});
//# sourceMappingURL=ActionReferenceSerializer.js.map
