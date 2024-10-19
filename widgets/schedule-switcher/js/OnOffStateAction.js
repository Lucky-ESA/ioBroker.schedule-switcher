(async () => {
    class OnOffStateAction extends HTMLElement {
        constructor() {
            super();
            this.sr = this.createShadowRoot();
        }

        connectedCallback() {
            this.sr.querySelector("#radio-on").addEventListener("input", this.onValueInput.bind(this));
            this.sr.querySelector("#radio-off").addEventListener("input", this.onValueInput.bind(this));
            this.sr.querySelector(`#radio-on-value`).textContent = vis.binds["schedule-switcher"].translate(
                "on",
                vis.binds["schedule-switcher"].wid,
                "connectedCallback",
            );
            this.sr.querySelector(`#radio-off-value`).textContent = vis.binds["schedule-switcher"].translate(
                "off",
                vis.binds["schedule-switcher"].wid,
                "connectedCallback",
            );
        }

        static get observedAttributes() {
            return ["data", "edit"];
        }

        attributeChangedCallback(attr) {
            if (attr === "data") {
                this.onValueChanged();
            } else if (attr === "edit") {
                this.onEditChange();
            }
        }

        get value() {
            return JSON.parse(this.getAttribute("data")).name === "On";
        }

        set value(val) {
            const data = JSON.parse(this.getAttribute("data"));
            data.name = val ? "On" : "Off";
            this.setAttribute("data", JSON.stringify(data));
            this.sr.dispatchEvent(new CustomEvent("data", { composed: true }));
        }

        get edit() {
            const attrValue = this.getAttribute("edit");
            return attrValue === "true";
        }

        set edit(value) {
            this.setAttribute("edit", value ? "true" : "false");
        }

        get widgetId() {
            return this.getAttribute("widgetid");
        }

        onValueChanged() {
            const wid = vis.binds["schedule-switcher"].wid;
            const newValue = this.value;
            const wd_id = this.getAttribute("widgetid") ? this.getAttribute("widgetid") : wid;
            const text = vis.binds["schedule-switcher"]
                .translate(newValue ? "on" : "off", wd_id, "onValueChanged")
                .toUpperCase();
            this.sr.querySelector(".view .value").textContent = text;
            this.sr.querySelector(`#radio-${newValue ? "on" : "off"}`).checked = true;
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

        onValueInput() {
            this.value = this.sr.querySelector("#radio-on").checked;
        }

        createShadowRoot() {
            const shadowRoot = this.attachShadow({ mode: "open" });
            shadowRoot.innerHTML = `
				<link rel="stylesheet" href="widgets/schedule-switcher/css/OnOffStateAction.css"/>
				<link rel="stylesheet" href="widgets/schedule-switcher/css/material-radio-button.css"/>
				<div class="container view">
						<div class="value"></div>
				</div>
				<div class="container edit" style="display: none">
                    <div class="md-radio md-radio-inline">
						<input id="radio-on" type="radio" name="switched-value-group">
						<label for="radio-on" id="radio-on-value"></label>
					</div>
					<div class="md-radio md-radio-inline">
						<input id="radio-off" type="radio" name="switched-value-group">
						<label for="radio-off" id="radio-off-value"></label>
					</div>
				</div>
			`;
            return shadowRoot;
        }
    }

    customElements.define("app-on-off-state-action-schedule", OnOffStateAction);
})();
