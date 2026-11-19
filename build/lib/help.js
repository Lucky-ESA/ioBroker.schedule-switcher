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
var help_exports = {};
__export(help_exports, {
  COMMANDS: () => COMMANDS,
  HELP: () => HELP
});
module.exports = __toCommonJS(help_exports);
const COMMANDS = [
  { command: "help", write: false },
  { command: "add-trigger", write: true },
  { command: "update-trigger", write: true },
  { command: "add-one-time-trigger", write: true },
  { command: "update-one-time-trigger", write: true },
  { command: "delete-trigger", write: true },
  { command: "enable-schedule", write: true },
  { command: "disable-schedule", write: true },
  { command: "change-name", write: true },
  { command: "change-switched-ids", write: true },
  { command: "change-switched-values", write: true },
  { command: "change-active", write: true },
  { command: "change-view-dataId", write: true },
  { command: "getActiv", write: false },
  { command: "getCountSchedule", write: false },
  { command: "getNameSchedule", write: false },
  { command: "getIdNameSchedule", write: false },
  { command: "week", write: true },
  { command: "astro", write: true },
  { command: "datetime", write: true },
  { command: "time", write: true },
  { command: "valueCheck", write: true },
  { command: "update-actionTime", write: true },
  { command: "update-nextTime", write: true },
  { command: "update-html", write: true },
  { command: "update-view", write: true }
];
const HELP = `ioBroker.schedule-switcher: on/off time schedules, made for vis widgets. A schedule switches one or more states
to its "on" or "off" value at times of the day on chosen weekdays, at astro times (sunrise ...) or once at a date.
An agent can read the schedules and their next switchings, add, change and delete triggers and switch schedules on
and off. New schedules are created only in the instance settings (one row per schedule).

Schedules: the state schedule-switcher.0.onoff.<n>.data (JSON; read it first), <n> = the number of the schedule:
{name, active?, onAction: {valueType (boolean, number or string), onValue, offValue, idsOfStatesToSet: [state
IDs]}, offAction (the same), triggers: [...]}. Every trigger has id (text: "0", "1" ...), objectId (= <n>),
valueCheck (true = do not write a state that has the value already) and action: {type: "OnOffStateAction", name:
"On" or "Off"} (writes onValue or offValue into the states), or with a condition {type: "ConditionAction",
condition: {type: "StringStateAndConstantCondition", stateId, constant (text), sign} or {type:
"StringStateAndStateCondition", stateId1, stateId2, sign}, action: {type: "OnOffStateAction", name}}: switches
only if the condition holds; sign "==", "!=" (compare as text), ">" or "<" (compare numbers). Trigger types:
- {type: "TimeTrigger", id, objectId, hour (0-23), minute (0-59), weekdays: [0-6] (0 = Sunday), valueCheck, action}
- {type: "AstroTrigger", id, objectId, astroTime (sunrise, sunset, solarNoon, sunriseEnd, goldenHourEnd,
  goldenHour, sunsetStart, dusk, nauticalDusk, night, nadir, nightEnd, nauticalDawn, dawn), shiftInMinutes
  (-120 to 120), weekdays, valueCheck, action}
- {type: "OneTimeTrigger", id, objectId, date (ISO time), timedate (true = shown as countdown, false = as date),
  valueCheck, action}: runs once at date, then it is deleted.
Times are the local time of the ioBroker host.

Commands (sendTo schedule-switcher.0); dataId = "schedule-switcher.0.onoff.<n>.data". The parameters may also be
wrapped as {parameter: {...}}. Only add-trigger with {parameter} answers on success. If a command fails (unknown
dataId, a missing name, a malformed trigger), it answers {error} (text); otherwise the commands send no answer: do
not wait for one, read data again to see the result. Send exactly the fields named here.
- add-trigger {dataId, triggerType: "TimeTrigger" or "AstroTrigger", actionType: "OnOffStateAction"}: adds a
  trigger "On" for all days at 0:00 (Time) or at sunrise (Astro) with the lowest free id. It is active at once:
  set it with update-trigger right after. Answer (only with {parameter}): the number of triggers before (= the id
  of the new trigger if the ids have no gaps).
- update-trigger {dataId, trigger}: replaces the Time or Astro trigger with the same id. Send the complete trigger
  as read from data, changed where needed (id is required; objectId is taken from dataId if missing).
- add-one-time-trigger {dataId, trigger}: trigger = JSON text (a string, not an object) of {type: "OneTimeTrigger",
  date, timedate, valueCheck, action}; the adapter sets id and objectId.
- update-one-time-trigger {dataId, trigger}: replaces the one-time trigger with the same id (trigger as object).
- delete-trigger {dataId, triggerId}: deletes a trigger; triggerId is text, e.g. "2".
- enable-schedule {dataId} / disable-schedule {dataId}: switches the schedule on / off.
- change-name {dataId, name}: renames the schedule (name is required).
- change-switched-ids {dataId, stateIds: [state IDs]}: the states the schedule writes (existing states only).
- change-switched-values {dataId, valueType: "boolean", "number" or "string", onValue, offValue}: the written
  values; boolean writes true / false, number needs numbers (missing = 0), string needs both texts.
  A vis widget of the schedule sends its own states and values again when it is shown.
- change-active {dataId, active: boolean}: true = the schedule stays enabled without a vis widget; false = a check
  (at the start of the instance, at night after changes) disables an enabled schedule that no widget shows. The
  other commands keep active as it is.
- getActiv, getCountSchedule, getNameSchedule, getIdNameSchedule {schedule: <n>}: for the settings, not for agents.
- week, astro, datetime, time, valueCheck (HTML table in vis), change-view-dataId (vis widgets), update-actionTime,
  update-nextTime, update-html, update-view (internal refreshes): not for agents.

States (schedule-switcher.0.*):
- onoff.<n>.enabled: write true / false to switch the schedule on / off (like enable-schedule / disable-schedule).
- nextEvents: JSON list of the next switchings: [{name, triggerid, type, action, states, active, hour, minute,
  timestamp, objectId}]; history: JSON list of the last switchings (if enabled in the settings).

How to talk to the user:
- Name schedules and states by their names, times in local time, weekdays by their names.
- Read data before a change; if several schedules fit, ask which one.
- Triggers and the switch of a schedule control real devices: change them only on the user's request; confirm
  before deleting a trigger or disabling a schedule.
- After a command read data (and nextEvents) again and tell the user what is set now.`;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  COMMANDS,
  HELP
});
//# sourceMappingURL=help.js.map
