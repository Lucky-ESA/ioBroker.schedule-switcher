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
var AstroTime_exports = {};
__export(AstroTime_exports, {
  AstroTime: () => AstroTime
});
module.exports = __toCommonJS(AstroTime_exports);
var AstroTime = /* @__PURE__ */ ((AstroTime2) => {
  AstroTime2["Sunrise"] = "sunrise";
  AstroTime2["SolarNoon"] = "solarNoon";
  AstroTime2["Sunset"] = "sunset";
  return AstroTime2;
})(AstroTime || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AstroTime
});
//# sourceMappingURL=AstroTime.js.map
