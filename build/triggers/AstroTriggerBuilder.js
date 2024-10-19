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
var AstroTriggerBuilder_exports = {};
__export(AstroTriggerBuilder_exports, {
  AstroTriggerBuilder: () => AstroTriggerBuilder
});
module.exports = __toCommonJS(AstroTriggerBuilder_exports);
var import_AstroTrigger = require("./AstroTrigger");
var import_DailyTriggerBuilder = require("./DailyTriggerBuilder");
class AstroTriggerBuilder extends import_DailyTriggerBuilder.DailyTriggerBuilder {
  astroTime = null;
  shift = 0;
  setAstroTime(astroTime) {
    this.astroTime = astroTime;
    return this;
  }
  setShift(shift) {
    this.shift = shift;
    return this;
  }
  setAction(action) {
    super.setAction(action);
    return this;
  }
  setId(id) {
    super.setId(id);
    return this;
  }
  setWeekdays(weekdays) {
    super.setWeekdays(weekdays);
    return this;
  }
  build() {
    return new import_AstroTrigger.AstroTrigger(
      this.getId(),
      this.astroTime,
      this.shift,
      this.getWeekdays(),
      this.getAction()
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AstroTriggerBuilder
});
//# sourceMappingURL=AstroTriggerBuilder.js.map
