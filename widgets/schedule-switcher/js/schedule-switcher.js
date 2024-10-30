/*
	ioBroker.vis schedule-switcher Widget-Set

	Copyright 2019-2024 walli545 walli5446@gmail.com
*/
"use strict";

// add translations for edit mode
const iobSystemDic = systemDictionary;
let timeSwitchDic;
$.get("../schedule-switcher.admin/words.js", function (script) {
    let translation = script.substring(script.indexOf("{"), script.length);
    translation = translation.substring(0, translation.lastIndexOf(";"));
    try {
        timeSwitchDic = JSON.parse(translation);
        $.extend(systemDictionary, iobSystemDic);
        $.extend(systemDictionary, timeSwitchDic);
    } catch (e) {
        console.log(`Translate error: ${e}`);
    }
});

// export vis binds for widget
vis.binds["schedule-switcher"] = {
    version: "0.0.3",
    showVersion: showVersion,
    createOnOffWidget: createOnOffWidget,
    onOffScheduleWidgets: {},
    getConditionStateIdsAndAlias: getConditionStateIdsAndAlias,
    getElementNameForTriggerType: getElementNameForTriggerType,
    getElementNameForActionType: getElementNameForActionType,
    onDataIdChange: onDataIdChange,
    sendMessage: sendMessage,
    translate: translate,
    addConditionToAction: addConditionToAction,
    wid: "",
};
vis.binds["schedule-switcher"].showVersion();

function showVersion() {
    if (vis.binds["schedule-switcher"].version) {
        console.log("Version schedule-switcher: " + vis.binds["schedule-switcher"].version);
    }
}

function sendMessage(cmd, data) {
    const sendto = {
        command: cmd,
        message: data,
    };
    console.debug("cmdsend: " + JSON.stringify(sendto));
    try {
        servConn._socket.emit("sendTo", "schedule-switcher", cmd, data);
    } catch (e) {
        vis.conn.setState("schedule-switcher.0.sendto", { val: JSON.stringify(sendto), ack: false });
    }
}

function translate(word, widgetid, func) {
    if (widgetid) {
        const newValue = vis.binds["schedule-switcher"].onOffScheduleWidgets[widgetid]
            ? vis.binds["schedule-switcher"].onOffScheduleWidgets[widgetid][word]
            : null;
        if (newValue != null && newValue != "") return newValue;
    }
    return translateWord(word, systemLang, timeSwitchDic);
}

function createOnOffWidget(widgetId, view, data, style) {
    vis.binds["schedule-switcher"].wid = widgetId;
    console.debug(`Create on/off widget ${widgetId}`);
    const widgetElement = document.querySelector(`#${widgetId}`);
    if (!widgetElement) {
        console.warn("Widget not found, waiting ...");
        return setTimeout(function () {
            vis.binds["schedule-switcher"].createOnOffWidget(widgetId, view, data, style);
        }, 100);
    }
    if (!validateOnOffWidgetSettings(widgetElement, data)) {
        return;
    }
    const element = document.createElement("app-on-off-schedules-widget");
    element.setAttribute("widgetid", widgetId);
    element.style.setProperty("--ts-widget-astro-icon-display", data.useAstroIcons ? "inline" : "none");
    element.style.setProperty("--ts-widget-astro-text-display", data.useAstroIcons ? "none" : "inline");
    if (data.widthActionValue != "") {
        element.style.setProperty("--ts-widget-state-action-width", data.widthActionValue);
    }
    if (data.useCSS) {
        if (data.fTimeIcon && data.fTimeIcon != "none")
            element.style.setProperty("--ts-widget-time-icon-display", data.fTimeIcon);
        if (data.bgNextTime && data.bgNextTime != "rgba(255,255,255,1)")
            element.style.setProperty("--ts-widget-astro-next-fg-color", data.bgNextTime);
        if (data.fsNextTime && data.fsNextTime != "2em")
            element.style.setProperty("--ts-widget-astro-next-font-size", data.fsNextTime);
        if (data.fsDateTime && data.fsDateTime != "230px")
            element.style.setProperty("--ts-widget-datetime-width", data.fsDateTime);
        if (data.bgwidget && data.bgwidget != "rgba(66,66,66,1)")
            element.style.setProperty("--ts-widget-bg-color", data.bgwidget);
        if (data.bgwidgetFont && data.bgwidgetFont != "rgba(255,255,255,1)")
            element.style.setProperty("--ts-widget-fg-color", data.bgwidgetFont);
        if (data.bgTriggerView && data.bgTriggerView != "rgba(39,39,39,1)")
            element.style.setProperty("--ts-widget-trigger-bg-color", data.bgTriggerView);
        if (data.bgTrigger && data.bgTrigger != "rgba(241,241,241,1)")
            element.style.setProperty("--ts-widget-add-trigger-dropdown-bg-color", data.bgTrigger);
        if (data.bgOn && data.bgOn != "rgba(51,122,183,1)")
            element.style.setProperty("--ts-widget-primary-color", data.bgOn);
        if (data.bgOnCo && data.bgOnCo != "rgba(47,47,47,1)")
            element.style.setProperty("--ts-widget-primary-color-container", data.bgOnCo);
        if (data.bgOff && data.bgOff != "rgba(192,192,192,1)")
            element.style.setProperty("--ts-widget-off-color", data.bgOff);
        if (data.bgOffCo && data.bgOffCo != "rgba(128,128,128,1)")
            element.style.setProperty("--ts-widget-off-color-container", data.bgOffCo);
        if (data.bgTriggerFont && data.bgTriggerFont != "rgba(0,0,0,1)")
            element.style.setProperty("--ts-widget-add-trigger-dropdown-fg-color", data.bgTriggerFont);
        if (data.bgTriggerHover && data.bgTriggerHover != "rgba(221,221,221,1)")
            element.style.setProperty("--ts-widget-add-trigger-dropdown-hover-bg-color", data.bgTriggerHover);
        if (data.fcSwitched && data.fcSwitched != "rgba(165,165,165,1)")
            element.style.setProperty("--ts-widget-oid-fg-color", data.fcSwitched);
        if (data.fcbutton && data.fcbutton != "rgba(255,255,255,1)")
            element.style.setProperty("--ts-widget-btn-fg-color", data.fcbutton);
        if (data.fcDisWeekday && data.fcDisWeekday != "rgba(93,93,93,1)")
            element.style.setProperty("--ts-widget-weekdays-disabled-fg-color", data.fcDisWeekday);
        if (data.fcAcWeekday && data.fcAcWeekday != "rgba(255,255,255,1)")
            element.style.setProperty("--ts-widget-weekdays-enabled-fg-color", data.fcAcWeekday);
        if (data.fcName && data.fcName != "rgba(255,255,255,1)")
            element.style.setProperty("--ts-widget-name-fg-color", data.fcName);
        if (data.fcTime && data.fcTime != "rgba(255,255,255,1)")
            element.style.setProperty("--ts-widget-switched-time-fg-color", data.fcTime);
        if (data.fcSwitch && data.fcSwitch != "rgba(255,255,255,1)")
            element.style.setProperty("--ts-widget-switched-value-fg-color", data.fcSwitch);
        if (data.fcAstro && data.fcAstro != "rgba(0,0,0,1)")
            element.style.setProperty("--ts-widget-astro-time-fg-color", data.fcAstro);
        if (data.fcAstroShift && data.fcAstroShift != "rgba(93,93,93,1)")
            element.style.setProperty("--ts-widget-astro-shift-fg-color", data.fcAstroShift);
        if (data.fcCondition && data.fcCondition != "rgba(255,255,255,1)")
            element.style.setProperty("--ts-widget-condition-fg-color", data.fcCondition);
        if (data.fFamily && data.fFamily != "'Roboto', 'Segoe UI', BlinkMacSystemFont, system-ui, -apple-system")
            element.style.setProperty("--ts-widget-font-family", data.fFamily);
        if (data.fsName && data.fsName != "2em") element.style.setProperty("--ts-widget-name-font-size", data.fsName);
        if (data.fsWeekdays && data.fsWeekdays != "15px")
            element.style.setProperty("--ts-widget-oid-font-size", data.fsSwitched);
        if (data.fDisplayEdit && data.fDisplayEdit != "block")
            element.style.setProperty("--ts-widget-edit-name-button-display", data.fDisplayEdit);
        if (data.fDisplayCondition && data.fDisplayCondition != "block")
            element.style.setProperty("-ts-widget-condition-display", data.fDisplayCondition);
        if (data.fIconFilter && data.fIconFilter != "1")
            element.style.setProperty("--ts-widget-img-btn-filter", `invert(${data.fIconFilter})`);
        if (data.fsWeekdays && data.fsWeekdays != "23px")
            element.style.setProperty("--ts-widget-weekdays-font-size", data.fsWeekdays);
        if (data.fsSwitchedValue && data.fsSwitchedValue != "2em")
            element.style.setProperty("--ts-widget-switched-value-font-size", data.fsSwitchedValue);
        if (data.fsSwitchedTime && data.fsSwitchedTime != "2em")
            element.style.setProperty("--ts-widget-switched-time-font-size", data.fsSwitchedTime);
        if (data.fsSwitchedAstro && data.fsSwitchedAstro != "1.5em")
            element.style.setProperty("--ts-widget-astro-time-font-size", data.fsSwitchedAstro);
        if (data.fsSwitchedAstroShift && data.fsSwitchedAstroShift != "1em")
            element.style.setProperty("--ts-widget-astro-shift-font-size", data.fsSwitchedAstroShift);
        if (data.fsCondition && data.fsCondition != "1em")
            element.style.setProperty("--ts-widget-condition-font-size", data.fsCondition);
    }
    widgetElement.appendChild(element);
}

/**
 * Gets triggered by vis editor when dataId value changes.
 */
function onDataIdChange(widgetId, view, newId, attr, isCss, oldId) {
    console.debug(
        `onDataIdChange: widgetId: ${widgetId} view: ${view} newId: ${newId} attr: ${attr} isCss: ${isCss} oldId: ${oldId}`,
    );
    // vis.conn.namespace == vis.0 / vis-2.0
    const addDataId = {
        prefix: vis.projectPrefix ? vis.projectPrefix.replace("/", "") : "",
        namespace: vis.conn.namespace,
        view: view,
        widgetId: widgetId,
        newId: newId,
        oldId: oldId,
    };
    if (newId) {
        const newIdSplit = newId.split(".");
        const id = parseInt(newIdSplit[3]);
        if (isNaN(id)) addDataId.newId = id;
    }
    if (oldId) {
        const newIdSplit = oldId.split(".");
        const id = parseInt(newIdSplit[3]);
        if (isNaN(id)) addDataId.oldId = id;
    }
    this.sendMessage("change-view-dataId", addDataId);
    if (vis.conn.namespace.startsWith("vis.")) {
        if (newId) {
            vis.views[view].widgets[widgetId].data["oid-enabled"] = newId.replace("data", "enabled");
        }
    }
}

function validateOnOffWidgetSettings(widgetElement, data) {
    if (!data["oid-dataId"]) {
        showWarningInWidget(widgetElement, "needToSelectDataId");
        return false;
    }
    if (!(data["oid-dataId"].startsWith("schedule-switcher.0.onoff") && data["oid-dataId"].endsWith("data"))) {
        showWarningInWidget(widgetElement, "needToSelectValidDataId");
        return false;
    }
    if (!data["oid-stateId1"]) {
        showWarningInWidget(widgetElement, "needToSelectStateId");
        return false;
    }
    if (data.valueType === "number") {
        if (Number.isNaN(Number.parseFloat(data.onValue))) {
            showWarningInWidget(widgetElement, "needToEnterValidNumberOn");
            return false;
        }
        if (Number.isNaN(Number.parseFloat(data.offValue))) {
            showWarningInWidget(widgetElement, "needToEnterValidNumberOff");
            return false;
        }
    } else if (data.valueType === "string") {
        if (data.onValue === undefined || data.offValue === undefined || data.onValue === "" || data.offValue === "") {
            showWarningInWidget(widgetElement, "needToEnterValidStringValue");
            return false;
        }
    }
    if (
        data["oid-enabled"] == null ||
        !(data["oid-enabled"].startsWith("schedule-switcher.0.onoff") && data["oid-enabled"].endsWith("enabled"))
    ) {
        showWarningInWidget(widgetElement, "needToSelectValidEnabled");
        return false;
    }
    return true;
}

function showWarningInWidget(widgetElement, warning) {
    const p = document.createElement("p");
    p.textContent = vis.binds["schedule-switcher"].translate(warning);
    while (widgetElement.firstChild) {
        widgetElement.removeChild(widgetElement.firstChild);
    }
    widgetElement.appendChild(p);
}

function getConditionStateIdsAndAlias(widgetId) {
    const data = vis.widgets[widgetId].data;
    const count = Number.parseInt(data.conditionStatesCount, 10);
    const ids = [];
    for (let i = 1; i <= count; i++) {
        const id = data[`oid-conditionStateId${i}`];
        if (id !== undefined && id !== "") {
            ids.push({ id: id, alias: data[`conditionStateAlias${i}`] });
        }
    }
    return ids;
}

function addConditionToAction(action, widgetId) {
    if (action.type === "OnOffStateAction") {
        const conditionAction = {
            type: "ConditionAction",
            condition: {
                type: "StringStateAndConstantCondition",
                constant: "true",
                stateId: getConditionStateIdsAndAlias(widgetId)[0].id,
                sign: "==",
            },
            action: action,
        };
        return conditionAction;
    }
    return null;
}

function getElementNameForTriggerType(type) {
    if (type === "TimeTrigger") {
        return "app-time-trigger-schedule";
    } else if (type === "AstroTrigger") {
        return "app-astro-trigger-schedule";
    } else {
        throw Error("No widget for trigger found");
    }
}

function getElementNameForActionType(type) {
    if (type === "OnOffStateAction") {
        return "app-on-off-state-action-schedule";
    } else if (type === "ConditionAction") {
        return "app-condition-action-schedule";
    } else {
        throw Error("No widget for action found");
    }
}
