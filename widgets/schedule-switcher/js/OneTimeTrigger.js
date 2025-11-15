(async () => {
    class OneTimeTrigger extends HTMLElement {
        constructor() {
            super();
            this.sr = this.createShadowRoot();
            this.errors = [];
            this.triggerErrors = [];
            this.triedSaving = false;
            this.milliseconds = -1;
            this.setDate = null;
            this.interval = null;
            this.noInput = true;
            this.checkValue = false;
            this.intervalTime = 500;
            this.checktime = new Date();
        }

        static get observedAttributes() {
            return ["trigger", "action"];
        }

        connectedCallback() {
            this.triedSaving = false;
            this.sr.querySelector(".button.delete").addEventListener("click", this.onDeleteClick.bind(this));
            this.sr.querySelector(".button.cancel").addEventListener("click", this.onCancelClick.bind(this));
            this.sr.querySelector(".button.save").addEventListener("click", this.onSaveClick.bind(this));
            this.sr.querySelector(".button.add").addEventListener("click", this.onAddConditionClick.bind(this));
            this.sr.querySelector(".button.edit").addEventListener("click", this.onEditClick.bind(this));
            this.sr.querySelector(".button.cancel_bottom").addEventListener("click", this.onCancelClick.bind(this));
            this.sr.querySelector(".button.save_bottom").addEventListener("click", this.onSaveClick.bind(this));

            this.sr.querySelector("input.hours").addEventListener("input", this.onTimeInput.bind(this));
            this.sr.querySelector("input.minutes").addEventListener("input", this.onTimeInput.bind(this));
            this.sr.querySelector("input.seconds").addEventListener("input", this.onTimeInput.bind(this));
            this.sr.querySelector("input.datetime").addEventListener("input", this.onDateTimeInput.bind(this));

            this.sr.querySelector("#radio-date").addEventListener("input", this.onDateInput.bind(this));
            this.sr.querySelector("#radio-time").addEventListener("input", this.onDateInput.bind(this));
            this.sr.querySelector("#checking").addEventListener("click", this.onCheckClick.bind(this));
            if (this.trigger) {
                //const checktime = new Date(Date.parse(this.trigger.date));
                if (this.checktime < new Date()) {
                    console.log("Expired - Delete trigger!");
                    this.interval && clearTimeout(this.interval);
                    this.onDeleteClick();
                }
            }
            let iconElement = this.sr.querySelector("#edit_src");
            iconElement.src = vis.binds["schedule-switcher"].getIcon("edit", this.widgetId);
            iconElement = this.sr.querySelector("#delete_src");
            iconElement.src = vis.binds["schedule-switcher"].getIcon("delete", this.widgetId);
            iconElement = this.sr.querySelector("#save_src");
            iconElement.src = vis.binds["schedule-switcher"].getIcon("save", this.widgetId);
            iconElement = this.sr.querySelector("#cancel_src");
            iconElement.src = vis.binds["schedule-switcher"].getIcon("cancel", this.widgetId);
            iconElement = this.sr.querySelector("#save_src_bottom");
            iconElement.src = vis.binds["schedule-switcher"].getIcon("save", this.widgetId);
            iconElement = this.sr.querySelector("#cancel_src_bottom");
            iconElement.src = vis.binds["schedule-switcher"].getIcon("cancel", this.widgetId);
            iconElement = this.sr.querySelector("#add_src");
            iconElement.src = vis.binds["schedule-switcher"].getIcon("add", this.widgetId);
        }

        updateTimeUntilTrigger() {
            if (this.trigger) {
                this.interval = null;
                this.sr.querySelector(".time").textContent = this.millisecondsToHuman(
                    new Date(this.trigger.date) - new Date(),
                );
                if (this.checktime < new Date()) {
                    return;
                }
                this.interval = setTimeout(() => this.updateTimeUntilTrigger(), this.intervalTime);
            }
        }

        targetTimeTrigger() {
            if (this.trigger && !this.trigger.timedate) {
                this.sr.querySelector(".targettime").textContent = this.targetTime();
            }
        }

        onEditClick() {
            const trigger = this.trigger;
            console.log(JSON.stringify(trigger));
            this.timedate = trigger.timedate;
            this.checkValue = trigger.valueCheck;
            this.withCheck = trigger.valueCheck;
            this.sr.querySelector(".container.edit").style.display = null;
            this.sr.querySelector(".container.view").style.display = "none";
            this.setViews();
            if (trigger.timedate) {
                const ms = new Date(trigger.date) - new Date();
                this.sr.querySelector("input.seconds").value = Math.floor((ms / 1000) % 60);
                this.sr.querySelector("input.minutes").value = Math.floor((ms / 1000 / 60) % 60);
                this.sr.querySelector("input.hours").value = Math.floor((ms / 1000 / 3600) % 24);
                this.sr.querySelector(`#radio-time`).checked = true;
                this.onTimeInput();
            } else {
                this.sr.querySelector(`#radio-date`).checked = true;
                this.setDateTime();
            }
        }

        attributeChangedCallback(attr) {
            if (attr === "action") {
                this.onActionChange();
            } else if (attr === "trigger") {
                this.onTriggerChange();
            }
        }

        get timedate() {
            const attrValue = this.getAttribute("timedate");
            return attrValue === "true";
        }

        set timedate(val) {
            this.setAttribute("timedate", val);
        }

        get trigger() {
            if (this.hasAttribute("trigger")) {
                return JSON.parse(this.getAttribute("trigger"));
            }
            return null;
        }

        get action() {
            return JSON.parse(this.getAttribute("action"));
        }

        get withCheck() {
            return this.sr.querySelector("#checking").classList.contains("checked");
        }

        set withCheck(withCheck) {
            if (withCheck) {
                this.sr.querySelector("#checking").classList.add("checked");
                console.log("checked");
            } else {
                this.sr.querySelector("#checking").classList.remove("checked");
                console.log("nochecked");
            }
        }

        get widgetId() {
            return this.getAttribute("widgetid");
        }

        onCheckClick() {
            //const trigger = this.trigger;
            const toggle = this.sr.querySelector("#checking");
            toggle.classList.toggle("checked");
            const val = toggle.classList.contains("checked");
            this.checkValue = val;
            this.withCheck = val;
        }

        onCancelClick() {
            if (this.trigger && this.trigger.id != null) {
                this.sr.querySelector(".container.edit").style.display = "none";
                this.sr.querySelector(".container.view").style.display = null;
                return;
            }
            this.setAttribute("trigger", null);
            this.sr.dispatchEvent(
                new CustomEvent("cancel-one-time-trigger-creation", {
                    detail: {},
                    composed: true,
                }),
            );
        }

        onDeleteClick() {
            this.sr.dispatchEvent(
                new CustomEvent("delete-one-time-trigger", {
                    detail: {},
                    composed: true,
                }),
            );
            this.sr.dispatchEvent(
                new CustomEvent("delete", {
                    detail: { id: this.trigger.id },
                    composed: true,
                }),
            );
        }

        onDeleteConditionClick() {
            if (this.action.type === "ConditionAction") {
                this.setAttribute("action", JSON.stringify(this.action.action));
            }
        }

        onAddConditionClick() {
            const conditionAction = vis.binds["schedule-switcher"].addConditionToAction(
                this.action,
                this.getAttribute("widgetid"),
            );
            if (conditionAction) {
                this.setAttribute("action", JSON.stringify(conditionAction));
            }
        }

        onDateInput() {
            this.timedate = this.sr.querySelector("#radio-time").checked;
            this.setViews();
            this.errors = [];
            this.triggerErrors = [];
            this.noInput = true;
            if (this.timedate) {
                this.setDate = null;
            } else {
                this.setDateTime();
            }
        }

        setViews() {
            if (this.timedate) {
                this.sr.querySelector(".container.edit .trigger").style.display = null;
                this.sr.querySelector("#trigger-header").style.display = null;
                this.sr.querySelector(".container.edit .trigger-date").style.display = "none";
                this.sr.querySelector("#trigger-date-header").style.display = "none";
            } else {
                this.sr.querySelector(".container.edit .trigger").style.display = "none";
                this.sr.querySelector("#trigger-header").style.display = "none";
                this.sr.querySelector(".container.edit .trigger-date").style.display = null;
                this.sr.querySelector("#trigger-date-header").style.display = null;
            }
        }

        setDateTime() {
            const newToday = new Date();
            let triggerDate;
            if (this.trigger && this.trigger.date) {
                triggerDate = new Date(this.trigger.date);
            }
            const today = this.trigger && !this.trigger.timedate ? triggerDate : newToday;
            this.sr.querySelector("#datetime").value = this.formatDate(today, 0);
            this.sr.querySelector("#datetime").min = this.formatDate(newToday, 0);
            this.sr.querySelector("#datetime").max = this.formatDate(newToday, 1);
        }

        formatDate(date, endYear) {
            return (
                `${date.getFullYear()}${endYear}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate()}` +
                `T${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
            );
        }

        onSaveClick() {
            this.updateValidationErrors();
            if (this.errors.length === 0) {
                let saveDate;
                if (!this.timedate && this.setDate) {
                    saveDate = new Date(this.setDate).toISOString();
                } else {
                    saveDate = new Date(new Date().getTime() + this.milliseconds).toISOString();
                }
                if (this.trigger && this.trigger.id != null) {
                    this.sr.querySelector(".container.edit").style.display = "none";
                    this.sr.querySelector(".container.view").style.display = null;
                    this.sr.dispatchEvent(
                        new CustomEvent("update", {
                            detail: {
                                trigger: {
                                    id: this.trigger.id,
                                    type: "OneTimeTrigger",
                                    timedate: this.timedate,
                                    valueCheck: this.checkValue,
                                    date: saveDate,
                                    action: JSON.parse(this.getActionElement(true).getAttribute("data")),
                                },
                            },
                            composed: true,
                        }),
                    );
                    return;
                }
                this.sr.dispatchEvent(
                    new CustomEvent("create", {
                        detail: {
                            trigger: {
                                type: "OneTimeTrigger",
                                timedate: this.timedate,
                                valueCheck: this.checkValue,
                                date: saveDate,
                                action: JSON.parse(this.getActionElement(true).getAttribute("data")),
                            },
                        },
                        composed: true,
                    }),
                );
                this.sr.dispatchEvent(
                    new CustomEvent("cancel-one-time-trigger-creation", {
                        detail: {},
                        composed: true,
                    }),
                );
            } else {
                if (!this.triedSaving) {
                    this.getActionElement(true).addEventListener("errors", this.updateValidationErrors.bind(this));
                }
            }
            this.triedSaving = true;
        }

        updateValidationErrors() {
            const errorsAction = JSON.parse(this.getActionElement(true).getAttribute("errors"));
            let errors = [];
            if (this.noInput) {
                errors.push(vis.binds["schedule-switcher"].translate("errorTime"));
            }
            if (this.triggerErrors) {
                errors = errors.concat(this.triggerErrors);
            }
            if (errorsAction) {
                errors = errors.concat(errorsAction);
            }
            this.errors = errors;
            this.sr.querySelector(".validation-errors-container").style.display = errors.length === 0 ? "none" : null;

            const validationErrorsList = this.sr.querySelector("#validation-errors");
            while (validationErrorsList.firstChild) {
                validationErrorsList.removeChild(validationErrorsList.firstChild);
            }
            this.errors.forEach(e => {
                const li = document.createElement("li");
                li.textContent = e;
                validationErrorsList.appendChild(li);
            });
        }

        onDateTimeInput() {
            const datetime = this.sr.querySelector("input.datetime").value;
            this.setDate = datetime;
            const check_date = new Date(this.setDate);
            const min_date = new Date(this.sr.querySelector("input.datetime").min);
            const max_date = new Date(this.sr.querySelector("input.datetime").max);
            this.noInput = false;
            const errors = [];
            if (isNaN(check_date.getTime())) {
                errors.push(vis.binds["schedule-switcher"].translate("errorInvalid"));
            }
            if (check_date <= min_date) {
                errors.push(vis.binds["schedule-switcher"].translate("errorLess"));
            }
            if (check_date >= max_date) {
                errors.push(vis.binds["schedule-switcher"].translate("errorGreater"));
            }
            this.triggerErrors = errors;
            if (this.triedSaving) {
                this.updateValidationErrors();
            }
        }

        onTimeInput() {
            this.noInput = false;
            const hours = Number.parseInt(this.sr.querySelector("input.hours").value, 10);
            const minutes = Number.parseInt(this.sr.querySelector("input.minutes").value, 10);
            const seconds = Number.parseInt(this.sr.querySelector("input.seconds").value, 10);
            const errors = [];
            if (Number.isNaN(hours) || hours < 0) {
                errors.push(vis.binds["schedule-switcher"].translate("errorHour"));
            }
            if (Number.isNaN(minutes) || minutes < 0 || minutes > 59) {
                errors.push(vis.binds["schedule-switcher"].translate("errorMinutes"));
            }
            if (Number.isNaN(seconds) || seconds < 0 || seconds > 59) {
                errors.push(vis.binds["schedule-switcher"].translate("errorSekundes"));
            }
            if (seconds === 0 && minutes === 0 && hours === 0) {
                this.noInput = true;
            }
            if (errors.length === 0) {
                this.milliseconds = hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;
            }
            this.triggerErrors = errors;
            if (this.triedSaving) {
                this.updateValidationErrors();
            }
        }

        createShadowRoot() {
            const shadowRoot = this.attachShadow({ mode: "open" });
            shadowRoot.innerHTML = `
				<link rel="stylesheet" href="widgets/schedule-switcher/css/OneTimeTrigger.css"/>
                <link rel="stylesheet" href="widgets/schedule-switcher/css/material-radio-button.css"/>
                <link rel="stylesheet" href="widgets/schedule-switcher/css/material-toggle-switch.css"/>
				<div class="container view" style="display: none">
					<div class="header">
						<div class="action"></div>
                        <img class="date icon"/>
					</div>
                    <div class="header">
                        <img id="check_value" class="button check"/>
                        <img id="edit_src" class="button edit"
                            title="${vis.binds["schedule-switcher"].translate("editTrigger")}"/>
                        <img id="delete_src" class="button delete"
                            title="${vis.binds["schedule-switcher"].translate("removeTrigger")}"/>
                    </div>
                    <div class="header">
						<div class="trigger">
							<div class="time"></div>
                            <div class="targettime"></div>
						</div>
					</div>
				</div>
				<div class="container edit">
					<div class="header">
						<img id="save_src" class="button save"
							title="${vis.binds["schedule-switcher"].translate("saveChanges")}"/>
						<img id="cancel_src" class="button cancel"
							title="${vis.binds["schedule-switcher"].translate("cancelEdit")}"/>
					</div>
					<div class="validation-errors-container" style="display: none;">
						<ul id="validation-errors"></ul>
					</div>
					<div>${vis.binds["schedule-switcher"].translate("switchedValue")}</div>
					<div class="action"></div>
					<div class="condition">
						<div>${vis.binds["schedule-switcher"].translate("condition")}</div>
						<img id="add_src" class="button add"
							title="${vis.binds["schedule-switcher"].translate("addCondition")}"/>
				    </div>
                    <div class="manual-container single">
                        <div id="checking" class="md-switch-container">
                            <div class="md-switch-track"></div>
                            <div class="md-switch-handle"></div>
                            <div class="md-switch-label" id="checking_name">${vis.binds["schedule-switcher"].translate("checkValue")}</div>
                        </div>
                    </div>
                    <div class="md-radio md-radio-inline">
						<input id="radio-time" type="radio" name="switched-value-date"/>
						<label for="radio-time">${vis.binds["schedule-switcher"].translate("withTime")}</label>
					</div>
                    <div class="md-radio md-radio-inline">
						<input id="radio-date" type="radio" name="switched-value-date"/>
						<label for="radio-date">${vis.binds["schedule-switcher"].translate("withDate")}</label>
					</div>
                    <div id="trigger-header">${vis.binds["schedule-switcher"].translate("oneTimeTriggerInfo")}</div>
					<div class="trigger">
						<input type="number" class="hours" min="0" max="23" step="1" placeholder="h" required value="0">
                    	<span>:</span>
                    	<input type="number" class="minutes" min="0" max="59" step="1" placeholder="mm" required value="0">
                    	<span>:</span>
                    	<input type="number" class="seconds" min="0" max="59" step="1" placeholder="ss" required value="0">
					</div>
                    <div id="trigger-date-header">${vis.binds["schedule-switcher"].translate("selectTimeDate")}</div>
                    <div class="trigger-date">
                        <input class="datetime" type="datetime-local" name="datetime" id="datetime" required />
					</div>
                    <div class="header_bottom">
                        <img id="save_src_bottom" class="button save_bottom"
                            title="${vis.binds["schedule-switcher"].translate("saveChanges")}"/>
                        <img id="cancel_src_bottom" class="button cancel_bottom"
                            title="${vis.binds["schedule-switcher"].translate("cancelEdit")}"/>
                    </div>
				</div>
			`;
            return shadowRoot;
        }

        setValueCheckIcon() {
            const iconElement = this.sr.querySelector("#check_value");
            if (this.checkValue) {
                iconElement.src = vis.binds["schedule-switcher"].getIcon("valueCheck", this.widgetId);
                iconElement.alt = vis.binds["schedule-switcher"].translate("valueCheckOn");
                iconElement.title = vis.binds["schedule-switcher"].translate("valueCheckOn");
            } else {
                iconElement.src = vis.binds["schedule-switcher"].getIcon("valueNoCheck", this.widgetId);
                iconElement.alt = vis.binds["schedule-switcher"].translate("valueCheckOff");
                iconElement.title = vis.binds["schedule-switcher"].translate("valueCheckOff");
            }
        }

        getActionElement(edit) {
            const newAction = this.action;
            const elementName = vis.binds["schedule-switcher"].getElementNameForActionType(newAction.type);
            return this.sr.querySelector(`.container.${edit ? "edit" : "view"} .action ${elementName}`);
        }

        onTriggerChange() {
            const newTrigger = this.trigger;
            this.checkValue = newTrigger ? newTrigger.valueCheck : false;
            this.setValueCheckIcon();
            if (newTrigger) {
                if (!this.trigger.timedate) {
                    this.intervalTime = 59500;
                }
                this.checktime = new Date(Date.parse(this.trigger.date));
                this.updateTimeUntilTrigger();
                this.targetTimeTrigger();
                this.sr.querySelector(".container.edit").style.display = "none";
                this.sr.querySelector(".container.view").style.display = null;
            }
        }

        onActionChange() {
            this.setValueCheckIcon();
            const newAction = this.action;
            const elementName = vis.binds["schedule-switcher"].getElementNameForActionType(newAction.type);
            const viewAction = this.sr.querySelector(".container.view .action");
            if (viewAction.firstChild) {
                viewAction.removeChild(viewAction.firstChild);
            }
            const actionView = document.createElement(elementName);
            actionView.setAttribute("widgetid", this.getAttribute("widgetid"));
            actionView.setAttribute("edit", "false");
            viewAction.appendChild(actionView);
            const editAction = this.sr.querySelector(".container.edit .action");
            if (editAction.firstChild) {
                editAction.removeChild(editAction.firstChild);
            }
            const iconElement = this.sr.querySelector(".view .date.icon");
            iconElement.src = vis.binds["schedule-switcher"].getIcon("onetime", this.widgetId);
            iconElement.alt = vis.binds["schedule-switcher"].translate("oneTimeTriggerInfo");
            iconElement.title = vis.binds["schedule-switcher"].translate("oneTimeTriggerInfo");
            const actionEdit = document.createElement(elementName);
            actionEdit.setAttribute("widgetid", this.getAttribute("widgetid"));
            actionEdit.setAttribute("edit", "true");
            actionEdit.addEventListener("delete-condition", this.onDeleteConditionClick.bind(this));
            editAction.appendChild(actionEdit);
            actionView.setAttribute("data", JSON.stringify(newAction));
            actionEdit.setAttribute("data", JSON.stringify(newAction));
            this.sr.querySelector(".condition").style.display = newAction.type === "ConditionAction" ? "none" : null;
            this.timedate = "true";
            this.sr.querySelector(`#radio-time`).checked = true;
            this.sr.querySelector(".container.edit .trigger-date").style.display = "none";
            this.sr.querySelector("#trigger-date-header").style.display = "none";
        }

        targetTime() {
            if (!this.trigger.timedate) {
                const n = new Date(this.trigger.date);
                return `${vis.binds["schedule-switcher"].translate("targetTime")} - ${this.dateView(n)}`;
            }
        }

        millisecondsToHuman(ms) {
            if (this.trigger && !this.trigger.timedate) {
                const d = new Date();
                return `${vis.binds["schedule-switcher"].translate("actualTime")} - ${this.dateView(d)}`;
            }
            const seconds = Math.floor((ms / 1000) % 60);
            const minutes = Math.floor((ms / 1000 / 60) % 60);
            const hours = Math.floor((ms / 1000 / 3600) % 24);

            const humanized = [hours, minutes, seconds]
                .map(v => (v < 0 ? 0 : v))
                .map(v => v.toString().padStart(2, "0"))
                .join(":");

            return `T - ${humanized}`;
        }

        dateView(d) {
            return (
                `${d.getFullYear()}-${`0${d.getMonth() + 1}`.slice(-2)}-${`0${d.getDate()}`.slice(-2)}` +
                ` ${`0${d.getHours()}`.slice(-2)}:${`0${d.getMinutes()}`.slice(-2)}`
            );
        }
    }

    customElements.define("app-one-time-trigger-schedule", OneTimeTrigger);
})();
