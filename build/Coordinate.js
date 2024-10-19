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
var Coordinate_exports = {};
__export(Coordinate_exports, {
  Coordinate: () => Coordinate
});
module.exports = __toCommonJS(Coordinate_exports);
class Coordinate {
  latitude;
  longitude;
  constructor(latitude, longitude, that) {
    if (Math.abs(latitude) > 90) {
      that.log.error("Latitude must be < 90 and > -90 - use 90");
      this.latitude = 90;
    } else {
      this.latitude = latitude;
    }
    if (Math.abs(longitude) > 180) {
      that.log.error("Longitude must be < 180 and > -180 - use 180");
      this.longitude = 180;
    } else {
      this.longitude = longitude;
    }
  }
  getLatitude() {
    return this.latitude;
  }
  getLongitude() {
    return this.longitude;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Coordinate
});
//# sourceMappingURL=Coordinate.js.map
