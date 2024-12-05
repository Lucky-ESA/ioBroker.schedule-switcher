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
var IoBrokerLoggingService_exports = {};
__export(IoBrokerLoggingService_exports, {
  IoBrokerLoggingService: () => IoBrokerLoggingService
});
module.exports = __toCommonJS(IoBrokerLoggingService_exports);
class IoBrokerLoggingService {
  /**
   * @param adapter ioBroker
   */
  constructor(adapter) {
    this.adapter = adapter;
  }
  /**
   * @param message Text
   */
  logDebug(message) {
    this.adapter.log.debug(message);
  }
  /**
   * @param message Text
   */
  logError(message) {
    this.adapter.log.error(message);
  }
  /**
   * @param message Text
   */
  logInfo(message) {
    this.adapter.log.info(message);
  }
  /**
   * @param message Text
   */
  logSilly(message) {
    this.adapter.log.silly(message);
  }
  /**
   * @param message Text
   */
  logWarn(message) {
    this.adapter.log.warn(message);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  IoBrokerLoggingService
});
//# sourceMappingURL=IoBrokerLoggingService.js.map
