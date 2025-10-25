(async () => {
    class TriggerWithAction extends HTMLElement {
        constructor() {
            super();
            this.sr = this.createShadowRoot();
            this.validationErrors = [];
            this.triedSaving = false;
            this.actionBeforeEdit = "";
            this.triggerBeforeEdit = "";
        }

        static get observedAttributes() {
            return ["trigger", "action", "edit"];
        }

        connectedCallback() {
            this.triedSaving = false;
            this.sr.querySelector(".button.delete").addEventListener("click", this.onDeleteClick.bind(this));
            this.sr.querySelector(".button.cancel").addEventListener("click", this.toggleEdit.bind(this));
            this.sr.querySelector(".button.edit").addEventListener("click", this.toggleEdit.bind(this));
            this.sr.querySelector(".button.save").addEventListener("click", this.onSaveClick.bind(this));
            this.sr.querySelector(".button.add").addEventListener("click", this.onAddConditionClick.bind(this));
            this.sr.querySelector("#checking").addEventListener("click", this.onCheckClick.bind(this));
            this.sr.querySelector(".button.cancel_bottom").addEventListener("click", this.toggleEdit.bind(this));
            this.sr.querySelector(".button.save_bottom").addEventListener("click", this.onSaveClick.bind(this));
        }

        attributeChangedCallback(attr) {
            if (attr === "action") {
                this.onActionChange();
            } else if (attr === "trigger") {
                this.onTriggerChange();
            } else if (attr === "edit") {
                this.onEditChange();
            }
        }

        get trigger() {
            return JSON.parse(this.getAttribute("trigger"));
        }

        get action() {
            return JSON.parse(this.getAttribute("action"));
        }

        get edit() {
            const attrValue = this.getAttribute("edit");
            return attrValue === "true";
        }

        set edit(value) {
            this.setAttribute("edit", value ? "true" : "false");
        }

        get valueCheck() {
            return JSON.parse(this.getAttribute("trigger"));
        }

        set valueCheck(data) {
            this.setAttribute("trigger", JSON.stringify(data));
            this.sr.dispatchEvent(new CustomEvent("trigger", { composed: true }));
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

        onCheckClick() {
            const trigger = this.trigger;
            const toggle = this.sr.querySelector("#checking");
            toggle.classList.toggle("checked");
            const val = toggle.classList.contains("checked");
            trigger.valueCheck = val;
            this.valueCheck = trigger;
        }

        onEditChange() {
            if (this.edit) {
                this.sr.querySelector(".container.edit").style.display = null;
                this.sr.querySelector(".container.view").style.display = "none";
            } else {
                this.sr.querySelector(".container.edit").style.display = "none";
                this.sr.querySelector(".container.view").style.display = null;
            }
        }

        onDeleteClick() {
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

        updateValidationErrors() {
            const errorsWeekdays = JSON.parse(this.getWeekdaysElement().getAttribute("errors"));
            const errorsTimeTrigger = JSON.parse(this.getTriggerElement(true).getAttribute("errors"));
            const errorsAction = JSON.parse(this.getActionElement(true).getAttribute("errors"));
            let errors = [];
            if (errorsTimeTrigger) {
                errors = errors.concat(errorsTimeTrigger);
            }
            if (errorsWeekdays) {
                errors = errors.concat(errorsWeekdays);
            }
            if (errorsAction) {
                errors = errors.concat(errorsAction);
            }
            this.validationErrors = errors;
            this.sr.querySelector(".validation-errors-container").style.display = errors.length === 0 ? "none" : null;

            const validationErrorsList = this.sr.querySelector("#validation-errors");
            while (validationErrorsList.firstChild) {
                validationErrorsList.removeChild(validationErrorsList.firstChild);
            }
            this.validationErrors.forEach(e => {
                const li = document.createElement("li");
                li.textContent = e;
                validationErrorsList.appendChild(li);
            });
        }

        onSaveClick() {
            this.updateValidationErrors();
            if (this.validationErrors.length === 0) {
                const selectedWeekdays = JSON.parse(
                    this.sr.querySelector(".edit app-weekdays-schedule").getAttribute("selected"),
                );
                const newTrigger = JSON.parse(this.getTriggerElement(true).getAttribute("data"));
                newTrigger.weekdays = selectedWeekdays;
                newTrigger.action = JSON.parse(this.getActionElement(true).getAttribute("data"));
                this.sr.dispatchEvent(
                    new CustomEvent("update", {
                        detail: {
                            trigger: newTrigger,
                        },
                        composed: true,
                    }),
                );
            } else {
                if (!this.triedSaving) {
                    this.getTriggerElement(true).addEventListener("errors", this.updateValidationErrors.bind(this));
                    this.getActionElement(true).addEventListener("errors", this.updateValidationErrors.bind(this));
                    this.getWeekdaysElement().addEventListener("errors", this.updateValidationErrors.bind(this));
                }
            }
            this.triedSaving = true;
        }

        toggleEdit() {
            this.edit = !this.edit;
            if (this.edit) {
                this.triggerBeforeEdit = JSON.stringify(this.trigger);
                this.actionBeforeEdit = JSON.stringify(this.action);
            } else {
                this.setAttribute("action", this.actionBeforeEdit);
                this.setAttribute("trigger", this.triggerBeforeEdit);
            }
        }

        createShadowRoot() {
            const shadowRoot = this.attachShadow({ mode: "open" });
            shadowRoot.innerHTML = `
					<link rel="stylesheet" href="widgets/schedule-switcher/css/TriggerWithAction.css"/>
                    <link rel="stylesheet" href="widgets/schedule-switcher/css/material-toggle-switch.css"/>
                    <link rel="stylesheet" href="widgets/schedule-switcher/css/OnOffScheduleWidget.css"/>
					<div class="container view">
						<div class="header">
							<div class="action"></div>
							<div class="trigger"></div>
						</div>
						<app-weekdays-schedule edit="false"></app-weekdays-schedule>
                        <div class="header">
                            <img id="check_value" class="button check" width="28px" height="28px"/>
                            <img class="button edit" src="widgets/schedule-switcher/img/edit-24px.svg" width="28px"
                                height="28px" title="${vis.binds["schedule-switcher"].translate("editTrigger")}"/>
                            <img class="button delete" src="widgets/schedule-switcher/img/delete-24px.svg" width="28px"
                                height="28px" title="${vis.binds["schedule-switcher"].translate("removeTrigger")}"/>
                        </div>
					</div>
					<div class="container edit" style="display: none">
						<div class="header">
							<img class="button save" src="widgets/schedule-switcher/img/save-24px.svg" width="28px"
								height="28px" title="${vis.binds["schedule-switcher"].translate("saveChanges")}"/>
							<img class="button cancel" src="widgets/schedule-switcher/img/cancel-24px.svg" width="28px"
								height="28px" title="${vis.binds["schedule-switcher"].translate("cancelEdit")}"/>
						</div>
						<div class="validation-errors-container" style="display: none;">
							<ul id="validation-errors"></ul>
						</div>
						<div>${vis.binds["schedule-switcher"].translate("switchedValue")}</div>
						<div class="action"></div>
						<div class="condition">
							<div>${vis.binds["schedule-switcher"].translate("condition")}</div>
						 	<img class="button add" src="widgets/schedule-switcher/img/add-24px.svg" width="28px"
								height="28px" title="${vis.binds["schedule-switcher"].translate("addCondition")}"/>
						</div>
                        <div class="manual-container single">
                            <div id="checking" class="md-switch-container">
                                <div class="md-switch-track"></div>
                                <div class="md-switch-handle"></div>
                                <div class="md-switch-label" id="checking_name">${vis.binds["schedule-switcher"].translate("checkValue")}</div>
                            </div>
                        </div>
						<div>${vis.binds["schedule-switcher"].translate("trigger")}</div>
						<div class="trigger"></div>
						<app-weekdays-schedule edit="true"></app-weekdays-schedule>
                        <div class="header_bottom">
                            <img class="button save_bottom" src="widgets/schedule-switcher/img/save-24px.svg" width="28px"
                                height="28px" title="${vis.binds["schedule-switcher"].translate("saveChanges")}"/>
                            <img class="button cancel_bottom" src="widgets/schedule-switcher/img/cancel-24px.svg" width="28px"
                                height="28px" title="${vis.binds["schedule-switcher"].translate("cancelEdit")}"/>
                        </div>
					</div>
				`;
            return shadowRoot;
        }

        getActionElement(edit) {
            const newAction = this.action;
            const elementName = vis.binds["schedule-switcher"].getElementNameForActionType(newAction.type);
            return this.sr.querySelector(`.container.${edit ? "edit" : "view"} .action ${elementName}`);
        }

        getTriggerElement(edit) {
            const newTrigger = this.trigger;
            const elementName = vis.binds["schedule-switcher"].getElementNameForTriggerType(newTrigger.type);
            return this.sr.querySelector(`.container.${edit ? "edit" : "view"} .trigger ${elementName}`);
        }

        getWeekdaysElement() {
            return this.sr.querySelector(".edit app-weekdays-schedule");
        }

        onTriggerChange() {
            const newTrigger = this.trigger;
            const iconElement = this.sr.querySelector("#check_value");
            if (this.trigger.valueCheck) {
                iconElement.src = `widgets/schedule-switcher/img/valueCheck.svg`;
                iconElement.alt = vis.binds["schedule-switcher"].translate("valueCheckOn");
                iconElement.title = vis.binds["schedule-switcher"].translate("valueCheckOn");
            } else {
                iconElement.src = `widgets/schedule-switcher/img/valueNoCheck.svg`;
                iconElement.alt = vis.binds["schedule-switcher"].translate("valueCheckOff");
                iconElement.title = vis.binds["schedule-switcher"].translate("valueCheckOff");
            }
            const elementName = vis.binds["schedule-switcher"].getElementNameForTriggerType(newTrigger.type);
            let triggerView = this.sr.querySelector(`.container.view .trigger ${elementName}`);
            if (!triggerView) {
                triggerView = document.createElement(elementName);
                triggerView.setAttribute("widgetid", this.getAttribute("widgetid"));
                triggerView.setAttribute("edit", "false");
                this.sr.querySelector(".container.view .trigger").appendChild(triggerView);
            }
            let triggerEdit = this.sr.querySelector(`.container.edit .trigger ${elementName}`);
            if (!triggerEdit) {
                triggerEdit = document.createElement(elementName);
                triggerEdit.setAttribute("widgetid", this.getAttribute("widgetid"));
                triggerEdit.setAttribute("edit", "true");
                this.sr.querySelector(".container.edit .trigger").appendChild(triggerEdit);
            }
            triggerView.setAttribute("data", JSON.stringify(newTrigger));
            triggerEdit.setAttribute("data", JSON.stringify(newTrigger));
            this.withCheck = newTrigger.valueCheck != null ? newTrigger.valueCheck : false;
            this.sr.querySelectorAll("app-weekdays-schedule").forEach(w => {
                w.setAttribute("selected", JSON.stringify(newTrigger.weekdays));
            });
        }

        onActionChange() {
            console.log("onActionChange");
            const newAction = this.action;
            console.log(JSON.stringify(newAction));
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
            const actionEdit = document.createElement(elementName);
            actionEdit.setAttribute("widgetid", this.getAttribute("widgetid"));
            actionEdit.setAttribute("edit", "true");
            actionEdit.addEventListener("delete-condition", this.onDeleteConditionClick.bind(this));
            editAction.appendChild(actionEdit);
            actionView.setAttribute("data", JSON.stringify(newAction));
            actionEdit.setAttribute("data", JSON.stringify(newAction));
            this.sr.querySelector(".condition").style.display = newAction.type === "ConditionAction" ? "none" : null;
        }
    }
    customElements.define("app-trigger-with-action-schedule", TriggerWithAction);
})();
