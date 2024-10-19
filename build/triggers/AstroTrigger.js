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
var AstroTrigger_exports = {};
__export(AstroTrigger_exports, {
  AstroTrigger: () => AstroTrigger
});
module.exports = __toCommonJS(AstroTrigger_exports);
var import_BaseDailyTrigger = require("./BaseDailyTrigger");
class AstroTrigger extends import_BaseDailyTrigger.BaseDailyTrigger {
  static MAX_SHIFT = 120;
  astroTime;
  shiftInMinutes;
  constructor(id, astroTime, shiftInMinutes, weekdays, action) {
    super(id, action, weekdays);
    if (astroTime == null) {
      throw new Error("Astro time may not be null.");
    }
    if (shiftInMinutes == null || shiftInMinutes > AstroTrigger.MAX_SHIFT || shiftInMinutes < -AstroTrigger.MAX_SHIFT) {
      throw new Error("Shift in minutes must be in range -120 to 120.");
    }
    this.astroTime = astroTime;
    this.shiftInMinutes = shiftInMinutes;
  }
  getAstroTime() {
    return this.astroTime;
  }
  getShiftInMinutes() {
    return this.shiftInMinutes;
  }
  toString() {
    return `AstroTrigger {id=${this.getId()}, astroTime=${this.getAstroTime()}, shift=${this.getShiftInMinutes()}, weekdays=[${this.getWeekdays()}]}`;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AstroTrigger
});
//# sourceMappingURL=AstroTrigger.js.map
