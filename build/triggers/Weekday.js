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
var Weekday_exports = {};
__export(Weekday_exports, {
  AllWeekdays: () => AllWeekdays,
  Weekday: () => Weekday
});
module.exports = __toCommonJS(Weekday_exports);
var Weekday = /* @__PURE__ */ ((Weekday2) => {
  Weekday2[Weekday2["Sunday"] = 0] = "Sunday";
  Weekday2[Weekday2["Monday"] = 1] = "Monday";
  Weekday2[Weekday2["Tuesday"] = 2] = "Tuesday";
  Weekday2[Weekday2["Wednesday"] = 3] = "Wednesday";
  Weekday2[Weekday2["Thursday"] = 4] = "Thursday";
  Weekday2[Weekday2["Friday"] = 5] = "Friday";
  Weekday2[Weekday2["Saturday"] = 6] = "Saturday";
  return Weekday2;
})(Weekday || {});
const AllWeekdays = [
  1 /* Monday */,
  2 /* Tuesday */,
  3 /* Wednesday */,
  4 /* Thursday */,
  5 /* Friday */,
  6 /* Saturday */,
  0 /* Sunday */
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AllWeekdays,
  Weekday
});
//# sourceMappingURL=Weekday.js.map
