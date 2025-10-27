(async () => {
    class OnOffScheduleWidget extends HTMLElement {
        constructor() {
            super();
            this.sr = this.createShadowRoot();
            this.settings = null;
            this.currentTriggers = [];
            this.connected = false;
        }

        static get observedAttributes() {
            return ["widgetid"];
        }

        connectedCallback() {
            if (this.connected) {
                return;
            }
            this.sr.querySelector("#btn-add-trigger-dropdown").addEventListener("click", e => {
                this.setAttribute("height", 0);
                if (this.sr.querySelector(".widget").clientHeight < 300) {
                    this.setAttribute("height", 1);
                    this.sr.querySelector(".widget").style.height = "299px";
                }
                const dropdown = this.sr.querySelector("#add-trigger-dropdown");
                dropdown.classList.add("show");
                e.stopImmediatePropagation();
                window.addEventListener(
                    "click",
                    () => {
                        if (this.getAttribute("height") > 0) {
                            this.sr.querySelector(".widget").style.height = "";
                        }
                        dropdown.classList.remove("show");
                    },
                    { once: true },
                );
            });
            this.sr.querySelector("#add-time-trigger").addEventListener("click", () => this.addTrigger("TimeTrigger"));
            this.sr
                .querySelector("#add-one-time-trigger")
                .addEventListener("click", () => this.addTrigger("OneTimeTrigger"));
            this.sr
                .querySelector("#add-astro-trigger")
                .addEventListener("click", () => this.addTrigger("AstroTrigger"));
            this.sr.querySelector(".button.edit").addEventListener("click", this.onEditNameClick.bind(this));
            this.sr.querySelector(".button.save").addEventListener("click", this.onSaveNameClick.bind(this));
            this.sr.querySelector("button#manual-off").addEventListener("click", this.onManualClick.bind(this));
            this.sr.querySelector("button#manual-on").addEventListener("click", this.onManualClick.bind(this));
            this.sr.querySelector("#enabled").addEventListener("click", () => {
                this.enabled = !this.enabled;
                vis.binds["schedule-switcher"].sendMessage(this.enabled ? "enable-schedule" : "disable-schedule", {
                    dataId: this.settings["oid-dataId"],
                });
            });
            this.sr.querySelector("#manual").addEventListener("click", () => {
                const toggle = this.sr.querySelector("#manual");
                toggle.classList.toggle("checked");
                this.onManualClick({
                    target: { id: toggle.classList.contains("checked") ? "manual-on" : "manual-off" },
                });
            });
            this.rename();
            this.connected = true;
        }

        attributeChangedCallback(attr) {
            if (attr === "widgetid") {
                this.onWidgetIdChange();
            }
        }

        get widgetId() {
            return this.getAttribute("widgetid");
        }

        set name(val) {
            this.sr.querySelector(".heading .view h1").textContent = val;
            this.sr.querySelector(".heading .edit input").value = val;
        }

        get enabled() {
            return this.sr.querySelector("#enabled").classList.contains("checked");
        }

        set enabled(val) {
            const toggle = this.sr.querySelector("#enabled");
            if (val) {
                toggle.classList.add("checked");
            } else {
                toggle.classList.remove("checked");
            }
        }

        set manualToggle(val) {
            const toggle = this.sr.querySelector("#manual");
            if (val) {
                toggle.classList.add("checked");
            } else {
                toggle.classList.remove("checked");
            }
        }

        set triggers(triggers) {
            this.currentTriggers = triggers;
            const oldTriggers = this.sr.querySelector(".triggers");
            const oneTimeTriggersInCreation = [];
            while (oldTriggers.firstChild) {
                const t = oldTriggers.removeChild(oldTriggers.firstChild);
                if (t.nodeName === "APP-ONE-TIME-TRIGGER-SCHEDULE" && t.getAttribute("edit")) {
                    oneTimeTriggersInCreation.push(t);
                }
            }
            oneTimeTriggersInCreation.forEach(t => {
                this.sr.querySelector(`.triggers`).appendChild(t);
            });
            triggers.forEach(t => {
                const element = document.createElement(
                    t.type === "OneTimeTrigger" ? "app-one-time-trigger-schedule" : "app-trigger-with-action-schedule",
                );
                element.setAttribute("widgetid", this.widgetId);
                element.setAttribute("action", JSON.stringify(t.action));
                delete t.action;
                element.setAttribute("trigger", JSON.stringify(t));
                element.setAttribute("id", t.id);
                element.addEventListener("delete", e => this.onTriggerDelete(e.detail.id));
                element.addEventListener("update", e => this.onTriggerUpdate(e.detail.trigger));
                element.addEventListener("delete-one-time-trigger", e => {
                    const trigger = this.sr.querySelector(`.triggers`);
                    if (Array.from(trigger.children).find(element => element === e.target)) {
                        trigger.removeChild(e.target);
                    }
                });
                this.sr.querySelector(`.triggers`).appendChild(element);
            });
        }

        set nameEditMode(isEdit) {
            if (isEdit) {
                this.sr.querySelector(".heading div.edit").style.display = null;
                this.sr.querySelector(".heading div.view").style.display = "none";
            } else {
                this.sr.querySelector(".heading div.edit").style.display = "none";
                this.sr.querySelector(".heading div.view").style.display = null;
            }
        }

        rename() {
            const wid = vis.binds["schedule-switcher"].wid;
            this.sr.querySelector(`#manual-on`).textContent = vis.binds["schedule-switcher"].translate(
                "allOn",
                this.getAttribute("widgetid") ? this.getAttribute("widgetid") : wid,
                "rename OnOffScheduleWidget",
            );
            this.sr.querySelector(`#manual-off`).textContent = vis.binds["schedule-switcher"].translate(
                "allOff",
                this.getAttribute("widgetid") ? this.getAttribute("widgetid") : wid,
                "rename OnOffScheduleWidget",
            );
        }

        showWarningInWidget(widgetElement, warning) {
            const p = document.createElement("p");
            p.textContent = vis.binds["schedule-switcher"].translate(warning);
            while (widgetElement.firstChild) {
                widgetElement.removeChild(widgetElement.firstChild);
            }
            widgetElement.appendChild(p);
        }

        validateOnOffStatesWithWidgetSettings(widgetElement, newSettings, state) {
            console.log("validateOnOffStatesWithWidgetSettings: " + JSON.stringify(state));
            if (state == null) return true;
            if (
                !state.onAction ||
                typeof state.onAction.idsOfStatesToSet !== "object" ||
                state.onAction.idsOfStatesToSet.length != newSettings.statesCount
            ) {
                this.showWarningInWidget(widgetElement, "errorMoreState");
                return false;
            }
            if (state.triggers.length > 0) {
                for (const trigger of state.triggers) {
                    if (trigger.action && trigger.action.type === "ConditionAction") {
                        if (!newSettings["oid-conditionStateId1"]) {
                            this.showWarningInWidget(widgetElement, "errorConditions");
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        async onWidgetIdChange() {
            console.log("widget id change");
            const newSettings = vis.widgets[this.widgetId].data;
            if (newSettings.showId && newSettings.statesCount === "1") {
                this.sr.querySelector("#switched-oid").textContent = newSettings["oid-stateId1"];
            }
            let oldSettings = vis.binds["schedule-switcher"].onOffScheduleWidgets[this.widgetId];
            this.settings = newSettings;
            const dataId = JSON.parse(vis.states.attr(`${this.settings["oid-dataId"]}.val`));
            if (!oldSettings && dataId) {
                oldSettings = {
                    onValue: dataId.onAction.onValue,
                    offValue: dataId.onAction.offValue,
                    stateIds: dataId.onAction.idsOfStatesToSet,
                    valueType: dataId.onAction.valueType,
                    on: newSettings.newOn,
                    off: newSettings.newOff,
                    allOn: newSettings.newAllOn,
                    allOff: newSettings.newAllOff,
                };
            }
            this.detectSettingsChanges(oldSettings, newSettings);
            this.updateStoredSettings(newSettings);
            const widgetElement = document.querySelector(`#${this.widgetId}`);
            if (!this.validateOnOffStatesWithWidgetSettings(widgetElement, newSettings, dataId)) {
                return;
            }
            if (dataId) {
                this.onScheduleDataChange(dataId);
            } else {
                console.warn(`Cannot read state ${this.settings["oid-dataId"]}!!!`);
            }
            this.enabled = vis.states.attr(`${this.settings["oid-enabled"]}.val`);
            vis.states.bind(`${newSettings["oid-dataId"]}.val`, (e, newVal) => {
                const scheduleData = JSON.parse(newVal);
                this.onScheduleDataChange(scheduleData);
            });
            vis.states.bind(`${this.settings["oid-enabled"]}.val`, (e, newVal) => (this.enabled = newVal));
            if (this.settings.showManualSwitch) {
                const stateIds = this.getStateIdsFromSettings(this.settings);
                if (stateIds.length === 1) {
                    this.manualToggle = this.convertToBooleanForManual(vis.states.attr(`${stateIds[0]}.val`));
                    this.sr.querySelector(".manual-container.single").style.display = null;
                    vis.states.bind(`${stateIds[0]}.val`, (_, v) => {
                        this.manualToggle = this.convertToBooleanForManual(v);
                    });
                } else {
                    this.sr.querySelector(".manual-container.multiple").style.display = null;
                }
            }
        }

        onScheduleDataChange(newData) {
            if (newData == null) return;
            this.name = newData.name;
            this.triggers = newData.triggers;
        }

        onEditNameClick() {
            this.nameEditMode = true;
        }

        onSaveNameClick() {
            const newName = this.sr.querySelector(".heading .edit input").value;
            vis.binds["schedule-switcher"].sendMessage("change-name", {
                dataId: this.settings["oid-dataId"],
                name: newName,
            });
            this.nameEditMode = false;
        }

        onManualClick(e) {
            const stateIds = this.getStateIdsFromSettings(this.settings);
            const valueType = this.settings.valueType;
            const isOnClick = e.target.id === "manual-on";
            let val = isOnClick ? this.settings.onValue : this.settings.offValue;
            if (valueType === "number") {
                val = Number.parseFloat(val);
            } else if (valueType === "boolean") {
                val = isOnClick;
            }
            stateIds.forEach(i => vis.conn.setState(i, val));
        }

        onTriggerDelete(triggerId) {
            vis.binds["schedule-switcher"].sendMessage("delete-trigger", {
                dataId: this.settings["oid-dataId"],
                triggerId: triggerId,
            });
        }

        onTriggerUpdate(trigger) {
            if (trigger.type === "OneTimeTrigger") {
                this.updateOneTimeTrigger(trigger);
            } else {
                vis.binds["schedule-switcher"].sendMessage("update-trigger", {
                    dataId: this.settings["oid-dataId"],
                    trigger: trigger,
                });
            }
        }

        addTrigger(type) {
            if (type === "OneTimeTrigger") {
                this.createOneTimeTrigger();
            } else {
                vis.binds["schedule-switcher"].sendMessage("add-trigger", {
                    dataId: this.settings["oid-dataId"],
                    triggerType: type,
                    actionType: "OnOffStateAction",
                });
            }
        }

        updateStoredSettings(newSettings) {
            vis.binds["schedule-switcher"].onOffScheduleWidgets[this.widgetId] = {
                onValue: newSettings.onValue,
                offValue: newSettings.offValue,
                stateIds: this.getStateIdsFromSettings(newSettings),
                valueType: newSettings.valueType,
                on: newSettings.newOn,
                off: newSettings.newOff,
                allOn: newSettings.newAllOn,
                allOff: newSettings.newAllOff,
            };
        }

        detectSettingsChanges(oldSettings, newSettings) {
            const newStateIds = this.getStateIdsFromSettings(newSettings);
            console.debug(`OLD: ${JSON.stringify(oldSettings)}`);
            if (
                oldSettings &&
                (newStateIds.length !== oldSettings.stateIds.length ||
                    newStateIds.some((value, index) => value !== oldSettings.stateIds[index]))
            ) {
                console.debug("sending change switched oids: " + JSON.stringify(newStateIds));
                vis.binds["schedule-switcher"].sendMessage("change-switched-ids", {
                    dataId: newSettings["oid-dataId"],
                    stateIds: newStateIds,
                });
            }
            if (newSettings.onValue === undefined || newSettings.offValue === undefined) return;
            console.debug("sending change switched values Oldon: " + oldSettings.onValue);
            console.debug("sending change switched values Oldoff: " + oldSettings.offValue);
            console.debug("sending change switched type: " + oldSettings.valueType);
            if (
                oldSettings &&
                (oldSettings.onValue != newSettings.onValue ||
                    oldSettings.offValue != newSettings.offValue ||
                    oldSettings.valueType != newSettings.valueType)
            ) {
                console.debug("sending change switched values on: " + newSettings.onValue);
                console.debug("sending change switched values off: " + newSettings.offValue);
                console.debug("sending change switched values off: " + newSettings.valueType);
                if (newSettings.onValue == "") delete newSettings.onValue;
                if (newSettings.offValue == "") delete newSettings.offValue;
                vis.binds["schedule-switcher"].sendMessage("change-switched-values", {
                    dataId: newSettings["oid-dataId"],
                    valueType: newSettings.valueType,
                    onValue:
                        newSettings.valueType === "number"
                            ? Number.parseFloat(newSettings.onValue)
                            : newSettings.onValue,
                    offValue:
                        newSettings.valueType === "number"
                            ? Number.parseFloat(newSettings.offValue)
                            : newSettings.offValue,
                });
            }
        }

        getStateIdsFromSettings(settings) {
            const count = Number.parseInt(settings.statesCount, 10);
            const ids = [];
            for (let i = 1; i <= count; i++) {
                const id = settings["oid-stateId" + i];
                if (id !== undefined && id !== "") {
                    ids.push(id);
                }
            }
            return ids;
        }

        convertToBooleanForManual(val) {
            if (this.settings.valueType !== "boolean") {
                val = val.toString() === this.settings.onValue.toString();
            }
            return val;
        }

        updateOneTimeTrigger(trigger) {
            vis.binds["schedule-switcher"].sendMessage("update-one-time-trigger", {
                dataId: this.settings["oid-dataId"],
                trigger: trigger,
            });
        }

        createOneTimeTrigger() {
            const trigger = document.createElement("app-one-time-trigger-schedule");
            trigger.setAttribute("edit", true);
            trigger.setAttribute("widgetid", this.getAttribute("widgetid"));
            trigger.setAttribute(
                "action",
                JSON.stringify({
                    type: "OnOffStateAction",
                    name: "On",
                }),
            );
            trigger.addEventListener("delete", e => this.onTriggerDelete(e.detail.id));
            trigger.addEventListener("cancel-one-time-trigger-creation", e => {
                const triggers = this.sr.querySelector(`.triggers`);
                if (Array.from(triggers.children).find(element => element === e.target)) {
                    triggers.removeChild(e.target);
                }
            });
            trigger.addEventListener("create", e => {
                console.log("got create, sending message");
                vis.binds["schedule-switcher"].sendMessage("add-one-time-trigger", {
                    dataId: this.settings["oid-dataId"],
                    trigger: JSON.stringify(e.detail.trigger),
                });
            });
            this.sr.querySelector(`.triggers`).appendChild(trigger);
        }

        createShadowRoot() {
            const shadowRoot = this.attachShadow({ mode: "open" });
            shadowRoot.innerHTML = `
				<link rel="stylesheet" href="widgets/schedule-switcher/css/material-toggle-switch.css" />
				<link rel="stylesheet" href="widgets/schedule-switcher/css/material-button.css" />
				<link rel="stylesheet" href="widgets/schedule-switcher/css/OnOffScheduleWidget.css" />
				<div class="widget">
					<div class="heading">
						<div class="view">
							<h1></h1>
							<img class="button edit" src="widgets/schedule-switcher/img/edit-24px.svg" width="28px" 
								height="28px" title="${vis.binds["schedule-switcher"].translate("editName")}"/>
						</div>
						<div class="edit" style="display: none;">
							<input type="text">
							<img class="button save" src="widgets/schedule-switcher/img/save-24px.svg" width="28px"
								height="28px"title="${vis.binds["schedule-switcher"].translate("saveName")}"/>
						</div>
					</div>
					<div id="switched-oid"></div>
					
					<div id="enabled" class="md-switch-container">
						<div class="md-switch-track"></div>
						<div class="md-switch-handle"></div>
						<div class="md-switch-label">${vis.binds["schedule-switcher"].translate("automaticSwitchingEnabled")}</div>
					</div>
					<div class="manual-container multiple" style="display: none;">
						<p>${vis.binds["schedule-switcher"].translate("manualSwitching")}</p>
						<button type="button" class="material-button" id="manual-on" title="${vis.binds["schedule-switcher"].translate("allOn")}">${vis.binds["schedule-switcher"].translate("allOn")}</button>
						<button type="button" class="material-button" id="manual-off" title="${vis.binds["schedule-switcher"].translate("allOff")}">${vis.binds["schedule-switcher"].translate("allOff")}</button>
					</div>
					<div class="manual-container single" style="display: none;">
						<div id="manual" class="md-switch-container">
							<div class="md-switch-track"></div>
							<div class="md-switch-handle"></div>
							<div class="md-switch-label">${vis.binds["schedule-switcher"].translate("currentValue")}</div>
						</div>
					</div>
					<div id="add">
						<div class="dropdown">
						  <img class="button" id="btn-add-trigger-dropdown" src="widgets/schedule-switcher/img/add-24px.svg" width="28px"
							height="28px" title="${vis.binds["schedule-switcher"].translate("addTrigger")}"/>
						  <div id="add-trigger-dropdown" class="dropdown-content">
							<div class="dropdown-btn" id="add-time-trigger">${vis.binds["schedule-switcher"].translate("addTimeTrigger")}</div>
							<div class="dropdown-btn" id="add-astro-trigger">${vis.binds["schedule-switcher"].translate("addAstroTrigger")}</div>
                            <div class="dropdown-btn" id="add-one-time-trigger">${vis.binds["schedule-switcher"].translate("addOneTimeTrigger")}</div>
						  </div>
						</div>
					</div>
					<div class="triggers">
				</div>
			`;
            return shadowRoot;
        }
    }
    customElements.define("app-on-off-schedules-widget", OnOffScheduleWidget);
})();
