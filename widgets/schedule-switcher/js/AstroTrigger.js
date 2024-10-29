(async () => {
    class AstroTrigger extends HTMLElement {
        constructor() {
            super();
            this.sr = this.createShadowRoot();
            this.astroTime = null;
            this.shiftInMinutes = -121;
            this.sr.querySelector("select#time").addEventListener("input", this.onInput.bind(this));
            this.sr.querySelector("input#shift").addEventListener("input", this.onInput.bind(this));
        }

        static get observedAttributes() {
            return ["data", "edit"];
        }

        connectedCallback() {
            console.debug("connectedCallback AstroTrigger");
        }

        attributeChangedCallback(attr) {
            if (attr === "data") {
                this.onDataChanged();
            } else if (attr === "edit") {
                this.onEditChange();
            }
        }

        get data() {
            return JSON.parse(this.getAttribute("data"));
        }

        set data(data) {
            this.setAttribute("data", JSON.stringify(data));
        }

        get edit() {
            const attrValue = this.getAttribute("edit");
            return attrValue === "true";
        }

        set edit(value) {
            this.setAttribute("edit", value ? "true" : "false");
        }

        set errors(value) {
            const oldErrors = this.errors;
            if (value.length === 0) {
                this.removeAttribute("errors");
            } else {
                this.setAttribute("errors", JSON.stringify(value));
            }

            if (oldErrors.length !== value.length) {
                this.sr.dispatchEvent(new CustomEvent("errors", { composed: true }));
            }
        }

        get errors() {
            const errors = this.getAttribute("errors");
            return errors ? JSON.parse(errors) : [];
        }

        onDataChanged() {
            if (this.data.todayTrigger && this.data.todayTrigger.hour != null && !this.edit) {
                this.sr.querySelector(".container.nextevent").style.display = null;
                const nextFormatted = `${("0" + this.data.todayTrigger.hour).slice(-2)}:${("0" + this.data.todayTrigger.minute).slice(-2)}`;
                this.sr.querySelector(".nextevent .next").textContent = nextFormatted;
            }
            if (this.data.astroTime !== this.astroTime || this.data.shiftInMinutes !== this.shiftInMinutes) {
                this.astroTime = this.data.astroTime;
                this.shiftInMinutes = this.data.shiftInMinutes;
                const translatedAstroTime = vis.binds["schedule-switcher"].translate(this.astroTime);
                this.sr.querySelector(".view .time.text").textContent = translatedAstroTime;
                const iconElement = this.sr.querySelector(".view .time.icon");
                iconElement.src = `widgets/schedule-switcher/img/astro/${this.astroTime}.svg`;
                iconElement.alt = translatedAstroTime;
                iconElement.title = translatedAstroTime;
                this.sr.querySelector(".edit #time").value = this.astroTime;
                let shiftFormatted = "";
                if (this.shiftInMinutes > 0) {
                    shiftFormatted = "+";
                }
                if (this.shiftInMinutes !== 0) {
                    shiftFormatted += this.shiftInMinutes + " min";
                } else {
                    shiftFormatted = " ";
                }
                this.sr.querySelector(".view .shift").textContent = shiftFormatted;
                this.sr.querySelector(".edit #shift").value = this.shiftInMinutes;
            }
        }

        onEditChange() {
            if (this.edit) {
                this.sr.querySelector(".container.edit").style.display = null;
                this.sr.querySelector(".container.view").style.display = "none";
                this.sr.querySelector(".container.nextevent").style.display = "none";
            } else {
                this.sr.querySelector(".container.edit").style.display = "none";
                this.sr.querySelector(".container.view").style.display = null;
            }
        }

        onInput() {
            const time = this.sr.querySelector(".edit select#time").value;
            const shift = Number.parseInt(this.sr.querySelector(".edit input#shift").value, 10);
            console.log(`on input, time is ${time} and shift is ${shift}`);
            if (Number.isNaN(shift) || !Number.isInteger(shift)) {
                this.errors = [vis.binds["schedule-switcher"].translate("shiftInteger")];
                return;
            }
            if (shift < -120 || shift > 120) {
                this.errors = [vis.binds["schedule-switcher"].translate("shiftValue")];
                return;
            }
            this.errors = [];
            this.astroTime = time;
            this.shiftInMinutes = shift;
            const data = this.data;
            data.astroTime = this.astroTime;
            data.shiftInMinutes = this.shiftInMinutes;
            this.data = data;
        }

        createShadowRoot() {
            const shadowRoot = this.attachShadow({ mode: "open" });
            shadowRoot.innerHTML = `
				<link rel="stylesheet" href="widgets/schedule-switcher/css/AstroTrigger.css"/>
				<div class="container view">
						<div class="time text"></div>
						<img class="time icon"/>
						<div class="shift"></div>
				</div>
                <div class="container nextevent" style="display: none">
                        <div class="next"></div>
				</div>
				<div class="container edit" style="display: none">
					<label for="time">${vis.binds["schedule-switcher"].translate("inputAstroTime")}</label>
                    <select id="time" required>
                    	<option value="sunrise" selected>${vis.binds["schedule-switcher"].translate("sunrise")}</option>
                    	<option value="solarNoon">${vis.binds["schedule-switcher"].translate("solarNoon")}</option>
                    	<option value="sunset">${vis.binds["schedule-switcher"].translate("sunset")}</option>
					</select>
					<label for="shift">${vis.binds["schedule-switcher"].translate("inputShiftInMinutes")}</label>
                    <input id="shift" type="number" min="-120" max="120" step="1" required/>
				</div>
			`;
            return shadowRoot;
        }
    }

    customElements.define("app-astro-trigger-schedule", AstroTrigger);
})();
