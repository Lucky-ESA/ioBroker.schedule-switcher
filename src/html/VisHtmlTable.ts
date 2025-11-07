import type { AllTriggers } from "../types/AllTrigger";
import type { htmltable, NextActionName } from "../types/htmlTable";

/**
 * VisHtmlTable
 */
export class VisHtmlTable implements htmltable {
    private adapter: ioBroker.Adapter;
    private delayTimeout: ioBroker.Timeout | undefined;
    private htmlVal: any;
    private stateVal: any;
    private lang: string;
    private works: boolean;

    /**
     * @param adapter ioBroker
     */
    constructor(adapter: ioBroker.Adapter) {
        this.adapter = adapter;
        this.htmlVal = {};
        this.stateVal = {};
        this.delayTimeout = undefined;
        this.lang = "de";
        this.works = false;
    }

    /**
     * @param id ID
     * @param val Value state
     */
    public async changeEnabled(id: string, val: ioBroker.State | null | undefined | boolean): Promise<void> {
        if (!this.adapter.config.usehtml) {
            return;
        }
        this.adapter.log.debug(`changeEnabled: ${id} - ${JSON.stringify(val)}`);
        const value = typeof val === "boolean" ? val : val?.val;
        if (value != null) {
            this.stateVal[id.replace(".enabled", ".data")].enabled = value;
            if (typeof val !== "boolean") {
                await this.createHTML();
            }
        }
    }

    /**
     * @param id ID
     * @param val Value state
     */
    public async changeHTML(id: string, val: ioBroker.State | null | undefined): Promise<void> {
        if (!this.adapter.config.usehtml) {
            return;
        }
        this.adapter.log.debug(`changeHTML: ${id} - ${JSON.stringify(val)}`);
        if (val != null && val.val != null) {
            this.htmlVal[id] = val.val;
            await this.createHTML();
        }
    }

    /**
     * updateHTML
     */
    public async updateHTML(): Promise<void> {
        if (!this.adapter.config.usehtml) {
            return;
        }
        await this.createHTML();
    }

    /**
     * @param id ID
     * @param val Value State
     * @param first boolean
     */
    public async changeTrigger(
        id: string,
        val: ioBroker.State | null | undefined | string,
        first = true,
    ): Promise<void> {
        if (!this.adapter.config.usehtml) {
            return;
        }
        this.adapter.log.debug(`changeTrigger: ${id} - ${JSON.stringify(val)} - ${first}`);
        const values = typeof val === "string" ? val : val?.val;
        if (id != undefined && values != null) {
            const enabled = await this.adapter.getStateAsync(id.replace(".data", ".enabled"));
            const value = typeof values === "string" ? JSON.parse(values) : values;
            value.enabled = enabled != null && enabled.val != null ? enabled.val : false;
            this.stateVal[id] = value;
            if (first) {
                await this.createHTML();
            }
        }
    }

    private async createHTML(): Promise<void> {
        this.adapter.log.debug(`Start update HTML!`);
        if (typeof this.stateVal === "object" && Object.keys(this.stateVal).length === 0) {
            return;
        }
        const id = this.htmlVal;
        let text = "";
        let count = 0;
        let countall = 0;
        const now: Date = new Date();
        const today_style: any = {
            0: "",
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
            6: "",
            7: "",
        };
        today_style[new Date().getDay()] = " font-weight:bold;";
        for (const state in this.stateVal) {
            const data = this.stateVal[state];
            let devices = "";
            let status = "";
            const next_event: string[] = ["", "", "", "", "", "", ""];
            let triggers = "";
            let iTag = "";
            let iTagEnd = "";
            let font_text_color: string = id.font_color_text_enabled;
            if (!data.enabled) {
                iTag = `<i>`;
                iTagEnd = `</i>`;
                font_text_color = id.font_color_text_disabled;
            }
            let counter = 0;
            let nextDateTime = 0;
            let nextDateTimeIcon = 0;
            let nextaction = "";
            const nextName: NextActionName[] = [];
            for (const trigger of data.triggers) {
                ++countall;
                nextDateTimeIcon = nextDateTime;
                let change_times = "";
                let times = "";
                let action = "";
                ++counter;
                const nextNameData: NextActionName = {
                    getDate: 0,
                    date: new Date(),
                    action: "",
                };
                const isodd = counter % 2 != 0 ? id.background_color_even : id.background_color_odd;
                let addDate = 0;
                if (trigger.type === "TimeTrigger") {
                    if (trigger.hour === 0 && trigger.minute === 0) {
                        addDate = 1;
                    }
                    const switchTime: Date = new Date(
                        `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() + addDate} ${trigger.hour}:${trigger.minute}`,
                    );
                    if (switchTime >= now && trigger.weekdays.includes(now.getDay())) {
                        nextDateTime = await this.nextEvent(now.getDay(), nextDateTime);
                    } else {
                        const t: string = await this.nextDateSwitch(new Date(), trigger);
                        nextDateTime = await this.nextEvent(new Date(t).getDay(), nextDateTime);
                    }
                    nextNameData.getDate = nextDateTime;
                    nextNameData.date = switchTime;
                    times = `${trigger.hour.toString().padStart(2, "0")}:${trigger.minute.toString().padStart(2, "0")}`;
                    change_times =
                        `<input type="time" id="nexttime${countall}" value="${times}" required />` +
                        ` <input for="nexttime" type="button" value="save" onclick="sendToTime('${this.adapter.namespace}', 'time', '${trigger.id}', '${state}', '${countall}')" /> `;
                } else if (trigger.type === "AstroTrigger") {
                    if (new Date(trigger.todayTrigger.date) >= now) {
                        nextDateTime = new Date(trigger.todayTrigger.date).getDay();
                    } else {
                        nextDateTime = await this.nextEvent(new Date(trigger.todayTrigger.date).getDay(), nextDateTime);
                    }
                    nextNameData.getDate = nextDateTime;
                    nextNameData.date = new Date(trigger.todayTrigger.date);
                    times =
                        `${trigger.todayTrigger.hour.toString().padStart(2, "0")}` +
                        `:${trigger.todayTrigger.minute.toString().padStart(2, "0")}`;
                    change_times = `<select id="timeselect${countall}">
                    <option value="sunrise" ${trigger.astroTime === "sunrise" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("sunrise")}</option>
                    <option value="solarNoon" ${trigger.astroTime === "solarNoon" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("solarNoon")}</option>
                    <option value="sunset" ${trigger.astroTime === "sunset" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("sunset")}</option>
                    <option value="sunriseEnd" ${trigger.astroTime === "sunriseEnd" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("sunriseEnd")}</option>
                    <option value="sunsetStart" ${trigger.astroTime === "sunsetStart" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("sunsetStart")}</option>
                    <option value="dusk" ${trigger.astroTime === "dusk" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("dusk")}</option>
                    <option value="dawn" ${trigger.astroTime === "dawn" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("dawn")}</option>
                    <option value="night" ${trigger.astroTime === "night" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("night")}</option>
                    <option value="nadir" ${trigger.astroTime === "nadir" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("nadir")}</option>
                    <option value="nightEnd" ${trigger.astroTime === "nightEnd" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("nightEnd")}</option>
                    <option value="nauticalDusk" ${trigger.astroTime === "nauticalDusk" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("nauticalDusk")}</option>
                    <option value="nauticalDawn" ${trigger.astroTime === "nauticalDawn" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("nauticalDawn")}</option>
                    <option value="goldenHour" ${trigger.astroTime === "goldenHour" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("goldenHour")}</option>
                    <option value="goldenHourEnd" ${trigger.astroTime === "goldenHourEnd" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("goldenHourEnd")}</option>
                    </select>
                    <input size="2px" type="number" id="shift${countall}" min="-120" max="120" step="1" placeholder="00" required value="${trigger.shiftInMinutes}" />
                    <input for="timeselect${countall}" type="button" value="save" onclick="sendToAstro('${this.adapter.namespace}', 'astro', '${state}', '${trigger.id}', '${countall}')" />`;
                } else if (trigger.type === "OneTimeTrigger") {
                    nextDateTime = await this.nextEvent(new Date(trigger.date).getDay(), nextDateTime);
                    if ((await this.getWeek(new Date(trigger.date))) === (await this.getWeek(new Date()))) {
                        trigger.weekdays = [new Date().getDay()];
                    }
                    nextNameData.getDate = nextDateTime;
                    nextNameData.date = new Date(trigger.date);
                    times =
                        `${new Date(trigger.date).getHours().toString().padStart(2, "0")}` +
                        `:${new Date(trigger.date).getMinutes().toString().padStart(2, "0")}`;
                    change_times =
                        `<input class="datetime" type="datetime-local" name="datetime" id="datetime${countall}" ` +
                        `value="${this.adapter.formatDate(new Date(trigger.date), "YYYY-MM-DD hh:mm")}"` +
                        `min="${this.adapter.formatDate(new Date(), "YYYY-MM-DD hh:mm")}"` +
                        `max="${this.adapter.formatDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), "YYYY-MM-DD hh:mm")}"` +
                        `required />` +
                        `<input for="datetime${countall}" type="button" value="save" onclick="sendToDateTime('${this.adapter.namespace}', 'datetime', '${trigger.id}', '${state}', '${countall}')" /> `;
                }
                if (trigger.action && trigger.action.type === "ConditionAction") {
                    const iconCon = trigger.action.action.name === "On" ? id.icon_true : id.icon_false;
                    action =
                        `&ensp;${iTag}${trigger.action.condition.constant}` +
                        `${trigger.action.condition.sign}${trigger.action.condition.constant}${iTagEnd}&ensp;` +
                        `${iconCon}`;
                    if (nextDateTimeIcon != nextDateTime) {
                        nextaction = iconCon;
                    }
                    nextNameData.action = iconCon;
                }
                if (trigger.action && trigger.action.type === "OnOffStateAction") {
                    const icon = trigger.action.name === "On" ? id.icon_true : id.icon_false;
                    action = `&ensp;${icon}`;
                    if (nextDateTimeIcon != nextDateTime) {
                        nextaction = icon;
                    }
                    nextNameData.action = icon;
                }
                let valueCheck = `&ensp;${trigger.valueCheck ? id.icon_state_check_yes : id.icon_state_check_no}`;
                valueCheck = `<button 
                title="${this.loadTitle(trigger.valueCheck ? "activated" : "disabled")}";
                style="border:none; cursor: pointer; 
                background-color:transparent;" 
                onClick="changValueCheck('${this.adapter.namespace}', 'valueCheck', '${state}', '${trigger.id}', '${trigger.valueCheck}')">${valueCheck}
                </button>`;

                triggers +=
                    `
                <tr style="background-color:${isodd}; 
                color:${font_text_color};
                font-weight:"bold";
                font-size:${id.header_font_size}px;">
                <td style="text-align:${id.column_align_row_01}">
                <label for="delete${countall}">${iTag}${trigger.type}${iTagEnd}</label>&ensp;
                <input type="checkbox" id="delete${countall}" name="delete${countall}" />
                <input for="delete${countall}" type="button" value="delete" onclick="deleteTrigger('${this.adapter.namespace}', 'delete-trigger', '${trigger.id}', '${state}', '${countall}')" />
                ${valueCheck}</td>
                <td title="${times}" style="text-align:${id.column_align_row_02}">${change_times}</td>
                <td title="${times}" style="text-align:${id.column_align_row_03}">${iTag}${times}${iTagEnd}${action}</td>
                <td id="weekday" ` +
                    `onClick="changeweekdays('${this.adapter.namespace}', 'week', '${state}', '${trigger.id}', 1, '${trigger.type}')" ` +
                    `style="cursor: pointer; text-align:${id.column_align_row_04}; ${today_style[1]} ` +
                    `color:${trigger.weekdays && trigger.weekdays.includes(1) ? id.font_color_weekdays_enabled : id.font_color_weekdays_disabled};">` +
                    `${iTag}${id.column_text_04}${iTagEnd}</td>
                <td id="weekday" ` +
                    `onClick="changeweekdays('${this.adapter.namespace}', 'week', '${state}', '${trigger.id}', 2, '${trigger.type}')" ` +
                    `style="cursor: pointer; text-align:${id.column_align_row_05}; ${today_style[2]} ` +
                    `color:${trigger.weekdays && trigger.weekdays.includes(2) ? id.font_color_weekdays_enabled : id.font_color_weekdays_disabled};">` +
                    `${iTag}${id.column_text_05}${iTagEnd}</td>
                <td id="weekday" ` +
                    `onClick="changeweekdays('${this.adapter.namespace}', 'week', '${state}', '${trigger.id}', 3, '${trigger.type}')" ` +
                    `style="cursor: pointer; text-align:${id.column_align_row_06}; ${today_style[3]} ` +
                    `color:${trigger.weekdays && trigger.weekdays.includes(3) ? id.font_color_weekdays_enabled : id.font_color_weekdays_disabled};">` +
                    `${iTag}${id.column_text_06}${iTagEnd}</td>
                <td id="weekday" ` +
                    `onClick="changeweekdays('${this.adapter.namespace}', 'week', '${state}', '${trigger.id}', 4, '${trigger.type}')" ` +
                    `style="cursor: pointer; text-align:${id.column_align_row_07}; ${today_style[4]} ` +
                    `color:${trigger.weekdays && trigger.weekdays.includes(4) ? id.font_color_weekdays_enabled : id.font_color_weekdays_disabled};">` +
                    `${iTag}${id.column_text_07}${iTagEnd}</td>
                <td id="weekday" ` +
                    `onClick="changeweekdays('${this.adapter.namespace}', 'week', '${state}', '${trigger.id}', 5, '${trigger.type}')" ` +
                    `style="cursor: pointer; text-align:${id.column_align_row_08}; ${today_style[5]} ` +
                    `color:${trigger.weekdays && trigger.weekdays.includes(5) ? id.font_color_weekdays_enabled : id.font_color_weekdays_disabled};">` +
                    `${iTag}${id.column_text_08}${iTagEnd}</td>
                <td id="weekday" ` +
                    `onClick="changeweekdays('${this.adapter.namespace}', 'week', '${state}', '${trigger.id}', 6, '${trigger.type}')" ` +
                    `style="cursor: pointer; text-align:${id.column_align_row_09}; ${today_style[6]} ` +
                    `color:${trigger.weekdays && trigger.weekdays.includes(6) ? id.font_color_weekdays_enabled : id.font_color_weekdays_disabled};">` +
                    `${iTag}${id.column_text_09}${iTagEnd}</td>
                <td id="weekday" ` +
                    `onClick="changeweekdays('${this.adapter.namespace}', 'week', '${state}', '${trigger.id}', 0, '${trigger.type}')" ` +
                    `style="cursor: pointer; text-align:${id.column_align_row_10}; ${today_style[0]} ` +
                    `color:${trigger.weekdays && trigger.weekdays.includes(0) ? id.font_color_weekdays_enabled : id.font_color_weekdays_disabled};">` +
                    `${iTag}${id.column_text_10}${iTagEnd}</td>
                </tr>`;
                nextName.push(nextNameData);
            }
            if (nextDateTime < 8) {
                if (nextDateTime === 7) {
                    nextDateTime = 0;
                }
                next_event[nextDateTime] = await this.nextAction(nextDateTime, nextName, nextaction);
            }
            if (data.onAction && data.onAction.idsOfStatesToSet) {
                if (data.onAction.idsOfStatesToSet[0] !== "default.state") {
                    for (const dev of data.onAction.idsOfStatesToSet) {
                        if (devices == "") {
                            devices = dev;
                        } else {
                            devices += `<br/>${dev}`;
                        }
                    }
                }
            }
            const val_enabled = data.enabled ? false : true;
            status =
                `${data.onAction.onValue}/${data.onAction.offValue}` +
                `&ensp;${data.enabled ? id.icon_true : id.icon_false}`;
            const status_icon = data.enabled ? "green" : "red";
            text += `
            <tr style="background-color:${id.background_color_trigger}; 
            color:${font_text_color};
            font-weight:"bold";
            font-size:${id.header_font_size}px;">
            <td style="text-align:${id.column_align_row_01}">
            <button 
                style="border:none; cursor: pointer; 
                background-color:transparent; 
                color:${status_icon}; 
                font-size:${id.column_width_01}px; 
                text-align:left" 
                value="${val_enabled}" onclick="setState('${state.replace("data", "enabled")}', this.value)">${id.icon_switch_symbol}
            </button>&ensp;&ensp;${iTag}${data.name}&ensp;(${count})${iTagEnd}</td>
            <td title="${devices}" style="text-align:${id.column_align_row_02}">${iTag}${devices}${iTagEnd}</td>
            <td title="${status}" style="text-align:${id.column_align_row_03}">${iTag}${status}${iTagEnd}</td>
            <td style="text-align:${id.column_align_row_04};">${next_event[1]}</td>
            <td style="text-align:${id.column_align_row_05};">${next_event[2]}</td>
            <td style="text-align:${id.column_align_row_06};">${next_event[3]}</td>
            <td style="text-align:${id.column_align_row_07};">${next_event[4]}</td>
            <td style="text-align:${id.column_align_row_08};">${next_event[5]}</td>
            <td style="text-align:${id.column_align_row_09};">${next_event[6]}</td>
            <td style="text-align:${id.column_align_row_10};">${next_event[0]}</td>
            </tr>`;
            text += triggers;
            ++count;
        }
        await this.mergeHTML(text, countall, count);
    }

    private nextAction(nextDateTime: number, nextName: NextActionName[], nextaction: string): Promise<string> {
        const action: any = nextName.filter((t: any) => t.getDate === nextDateTime);
        if (action && action.length > 0) {
            const next = action.sort((a: any, b: any) => a.date - b.date);
            return next[0].action;
        }
        return Promise.resolve(nextaction);
    }

    private getWeek(times: Date): Promise<number> {
        const onejan: any = new Date(times.getFullYear(), 0, 1);
        const today: any = new Date(times.getFullYear(), times.getMonth(), times.getDate());
        const dayOfYear = (today - onejan + 86400000) / 86400000;
        return Promise.resolve(Math.ceil(dayOfYear / 7));
    }

    private nextEvent(actual: number, next: number): Promise<number> {
        if (actual === 0) {
            actual = 7;
        }
        if (actual > next) {
            return Promise.resolve(actual);
        }
        return Promise.resolve(next);
    }

    private async nextDateSwitch(now: Date, trigger: AllTriggers): Promise<string> {
        let diffDays = 0;
        const nextDay: number =
            trigger.weekdays.length === 1
                ? trigger.weekdays[0]
                : await this.nextActiveDay(trigger.weekdays, now.getDay());
        if (nextDay > now.getDay()) {
            diffDays = nextDay - now.getDay();
        } else {
            diffDays = nextDay + 7 - now.getDay();
        }
        const next: Date = new Date(now.setDate(now.getDate() + diffDays));
        const hour = trigger.hour != null ? trigger.hour : trigger.todayTrigger.hour;
        const minute = trigger.minute != null ? trigger.minute : trigger.todayTrigger.minute;
        return new Date(
            `${next.getFullYear()}-${next.getMonth() + 1}-${next.getDate()} ${hour}:${minute}`,
        ).toISOString();
    }

    private nextActiveDay(array: number[], day: number): Promise<number> {
        array = array.map(val => {
            return val === 0 ? 7 : val;
        });
        const numChecker: any = (num: any) => array.find(v => v > num);
        const next: number | undefined = numChecker(day);
        return Promise.resolve(next == undefined ? 0 : next);
    }

    private async mergeHTML(htmltext: string, countall: number, count: number): Promise<void> {
        this.adapter.log.debug(`Start merge HTML code.`);
        const id = this.htmlVal;
        let div = '<div class="container">';
        let div_css = `
        div.container {
            align-items: center;
            justify-content: center;
        }`;
        let min = "";
        if (id.jarvis) {
            div = "<div>";
            div_css = "";
            min = "min-width:100%;";
        }
        const htmlStart = `
        <title>Schedule-Switcher</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
        <style>
        * {
            margin: 0;
        }
        body {
            background-color: ${id.background_color_body}; margin: 0 auto;
        }
        p {
            padding-top: 10px; padding-bottom: 10px; text-align: ${id.p_tag_text_algin};
        }
        #updatetime:hover {
            cursor: pointer;
        }
        #weekday:hover {
            cursor: pointer;
            background-color: ${id.background_color_weekdays_hover};
        }
        td {
            padding:${id.td_tag_cell}px; border:0px solid ${id.td_tag_border_color}; 
            border-right:${id.td_tag_border_right}px solid ${id.td_tag_border_color};
            border-bottom:${id.td_tag_border_bottom}px solid ${id.td_tag_border_color};
        }
        table {
            width: ${id.table_tag_width};
            margin: ${id.table_tag_text_align};
            border:1px solid ${id.table_tag_border_color};
            border-spacing: ${id.table_tag_cell}px;
            border-collapse: collapse;
        }
        ${div_css}
        thread {
            display: table-header-group;
        }
        tbody {
            display: table-row-group;
        }
        tfoot {
            display: table-footer-group
        }
        </style>
        <script> 
        function deleteTrigger(stateId, command, id, dataid, count) {
            var checked = document.getElementById('delete' + count).checked;
            if (checked) {
                var data = {
                    "triggerId": id,
                    "dataId": dataid,
                };
                this.servConn._socket.emit("sendTo", stateId, command, data);
            }
        }
        function changeweekdays(stateId, command, dataid, id, changeid, type) {
            if (type === "OneTimeTrigger") return;
            var data = {
                "changeid": changeid,
                "triggerid": id,
                "dataid": dataid
            };
            this.servConn._socket.emit("sendTo", stateId, command, data);
        }
        function changValueCheck(stateId, command, dataid, id, value) {
            var data = {
                "changeval": value,
                "triggerid": id,
                "dataid": dataid
            };
            this.servConn._socket.emit("sendTo", stateId, command, data);
        }
        function updateTrigger(stateId) {
            this.servConn._socket.emit("setState", stateId + '.html.update', true);
        }
        function setState(stateId, value) {
            this.servConn._socket.emit("setState", stateId, value == "false" ? false : true);
        }
        function sendToAstro(stateId, command, dataid, id, count) {
            var timeselect = document.getElementById('timeselect' + count).value;
            var shift = document.getElementById('shift' + count).value;
            var data = {
                "astrotime": timeselect,
                "shift": shift,
                "triggerid": id,
                "dataid": dataid
            };
            this.servConn._socket.emit("sendTo", stateId, command, data);
        }
        function sendToDateTime(stateId, command, id, dataid, count) {
            var value = document.getElementById('datetime' + count).value;
            var data = {
                "time": value,
                "triggerid": id,
                "dataid": dataid
            };
            this.servConn._socket.emit("sendTo", stateId, command, data);
        }
        function sendToTime(stateId, command, id, dataid, count) {
            var value = document.getElementById('nexttime' + count).value;
            var data = {
                "time": value,
                "triggerid": id,
                "dataid": dataid
            };
            this.servConn._socket.emit("sendTo", stateId, command, data);
        }
        </script>
        ${div}
        <table style="${min} width:${id.header_width};
        border:${id.header_border}px; border-color:${id.header_tag_border_color}; 
        font-size:${id.header_font_size}px; font-family:${id.header_font_family}; 
        background-image: linear-gradient(42deg,${id.header_linear_color_2},
        ${id.header_linear_color_1});">
        <thead>
        <tr>
        <th colspan="10" scope="colgroup">
        <p onClick="updateTrigger('${this.adapter.namespace}')"
        id="updatetime" style="color:${id.top_text_color}; font-family:${id.top_font_family}; 
        font-size:${id.top_font_size}px; font-weight:${id.top_font_weight}">
        ${id.top_text}&ensp;&ensp;${await this.helper_translator("top_last_update")} 
        ${this.adapter.formatDate(new Date(), "TT.MM.JJJJ hh:mm:ss")}</p></th>
        </tr>
        <tr style="color:${id.headline_color}; height:${id.headline_height}px;
        font-size: ${id.headline_font_size}px; font-weight: ${id.headline_weight}; 
        border-bottom: ${id.headline_underlined}px solid ${id.headline_underlined_color}">
        <th style="text-align:${id.column_align_01}; width:${id.column_width_01}">
        ${id.column_text_01}
        </th>
        <th style="text-align:${id.column_align_02}; width:${id.column_width_02}">
        ${id.column_text_02}
        </th>
        <th style="text-align:${id.column_align_03}; width:${id.column_width_03}">
        ${id.column_text_03}
        </th>
        <th style="text-align:${id.column_align_04}; width:${id.column_width_04}">
        ${id.column_text_04}
        </th>
        <th style="text-align:${id.column_align_05}; width:${id.column_width_05}">
        ${id.column_text_05}
        </th>
        <th style="text-align:${id.column_align_06}; width:${id.column_width_06}">
        ${id.column_text_06}
        </th>
        <th style="text-align:${id.column_align_07}; width:${id.column_width_07}">
        ${id.column_text_07}
        </th>
        <th style="text-align:${id.column_align_08}; width:${id.column_width_08}">
        ${id.column_text_08}
        </th>
        <th style="text-align:${id.column_align_09}; width:${id.column_width_09}">
        ${id.column_text_09}
        </th>
        <th style="text-align:${id.column_align_10}; width:${id.column_width_10}">
        ${id.column_text_10}
        </th>
        </tr>
        </thead>
        <tfoot>
        <tr>
        <th colspan="10" scope="colgroup">
        <p style="color:${id.top_text_color}; font-family:${id.top_font_family}; 
        font-size:${id.top_font_size}px; font-weight:${id.top_font_weight}">
        ${await this.helper_translator("footerobject")}&ensp;&ensp;${count}</br>
        ${await this.helper_translator("footer")}&ensp;&ensp;${countall}</p></th>
        </tr>
        </tfoot>
        <tbody>
        ${htmltext}
        </tbody>
        </table></div>`;
        await this.adapter.setState(`html.html_code`, {
            val: htmlStart,
            ack: true,
        });
        this.adapter.log.debug(`Save HTML code.`);
    }

    private helper_translator(word: string): Promise<string> {
        const all: any = {
            top_last_update: {
                en: "Last update:",
                de: "Letzte Aktualisierung:",
                ru: "Последнее обновление:",
                pt: "Última atualização:",
                nl: "Laatste update:",
                fr: "Dernière mise à jour :",
                it: "Ultimo aggiornamento:",
                es: "Última actualización:",
                pl: "Ostatnia aktualizacja",
                uk: "Останнє оновлення:",
                "zh-cn": "上次更新:",
            },
            footer: {
                en: "Total trigger",
                de: "Gesamtauslösung",
                ru: "Общий триггер",
                pt: "Total de gatilho",
                nl: "Totaal trigger",
                fr: "Déclencheur total",
                it: "Attacco totale",
                es: "Total disparador",
                pl: "Wyłącznik całkowity",
                uk: "Загальний тригер",
                "zh-cn": "总触发数",
            },
            footerobject: {
                en: "Total objects",
                de: "Objekte insgesamt",
                ru: "Всего объектов",
                pt: "Objetos totais",
                nl: "Totaal objecten",
                fr: "Total des objets",
                it: "Oggetti totali",
                es: "Total de objetos",
                pl: "Całkowita liczba obiektów",
                uk: "Всього об'єктів",
                "zh-cn": "目标共计",
            },
            sunrise: {
                en: "Sunrise",
                de: "Sonnenaufgang",
                ru: "Восход",
                pt: "Nascer do sol",
                nl: "zonsopkomst",
                fr: "lever du soleil",
                it: "Alba",
                es: "amanecer",
                pl: "wschód słońca",
                uk: "Схід сонця",
                "zh-cn": "日出",
            },
            sunset: {
                en: "Sunset",
                de: "Sonnenuntergang",
                ru: "Закат солнца",
                pt: "Pôr do sol",
                nl: "Zonsondergang",
                fr: "Le coucher du soleil",
                it: "Tramonto",
                es: "Puesta de sol",
                pl: "Zachód słońca",
                uk: "Захід сонця",
                "zh-cn": "日落",
            },
            solarNoon: {
                en: "Noon",
                de: "Mittag",
                ru: "Полдень",
                pt: "Meio-dia",
                nl: "Middag",
                fr: "Le midi",
                it: "Mezzogiorno",
                es: "Mediodía",
                pl: "Południe",
                uk: "полудень",
                "zh-cn": "中午",
            },
            sunriseEnd: {
                en: "Sunrise end",
                de: "Ende Sonnenaufgangs",
                ru: "Конец восхода солнца",
                pt: "Fim do nascer do sol",
                nl: "Zonsopgang einde",
                fr: "Fin du lever du soleil",
                it: "Fine dell'alba",
                es: "Fin del amanecer",
                pl: "Koniec wschodu słońca",
                uk: "Кінець сходу сонця",
                "zh-cn": "日出结束",
            },
            goldenHourEnd: {
                en: "End golden dusk",
                de: "Ende goldenen Dämmerung",
                ru: "Конец золотых сумерек",
                pt: "Fim do crepúsculo dourado",
                nl: "Einde gouden schemering",
                fr: "crépuscule doré",
                it: "Fine del crepuscolo dorato",
                es: "Fin del crepúsculo dorado",
                pl: "Koniec złotego zmierzchu",
                uk: "Кінець золотих сутінків",
                "zh-cn": "金色黄昏结束",
            },
            goldenHour: {
                en: "Start golden dusk",
                de: "Beginn goldenen Dämmerung",
                ru: "Начать золотые сумерки",
                pt: "Comece o crepúsculo dourado",
                nl: "Begin gouden schemering",
                fr: "Début du crépuscule doré",
                it: "Inizia il crepuscolo dorato",
                es: "Comienza el crepúsculo dorado",
                pl: "Rozpocznij złoty zmierzch",
                uk: "Початок золотих сутінків",
                "zh-cn": "金色黄昏伊始",
            },
            sunsetStart: {
                en: "Start sunset",
                de: "Sonnenuntergang beginnt",
                ru: "Начать закат",
                pt: "Começar o pôr do sol",
                nl: "Begin zonsondergang",
                fr: "Début du coucher du soleil",
                it: "Inizio tramonto",
                es: "Comienza el atardecer",
                pl: "Rozpocznij zachód słońca",
                uk: "Початок заходу сонця",
                "zh-cn": "日落开始",
            },
            dusk: {
                en: "Dusk",
                de: "Dämmerung",
                ru: "Сумерки",
                pt: "Crepúsculo",
                nl: "Schemering",
                fr: "Crépuscule",
                it: "Crepuscolo",
                es: "Oscuridad",
                pl: "Zmierzch",
                uk: "Сутінки",
                "zh-cn": "黄昏",
            },
            nauticalDusk: {
                en: "Nautical dusk",
                de: "Nautische Dämmerung",
                ru: "Морские сумерки",
                pt: "Crepúsculo náutico",
                nl: "Nautische schemering",
                fr: "crépuscule nautique",
                it: "Crepuscolo nautico",
                es: "Atardecer náutico",
                pl: "Zmierzch morski",
                uk: "Морські сутінки",
                "zh-cn": "航海黄昏",
            },
            night: {
                en: "Night",
                de: "Nacht",
                ru: "Ночь",
                pt: "Noite",
                nl: "Nacht",
                fr: "Nuit",
                it: "Notte",
                es: "Noche",
                pl: "Noc",
                uk: "Ніч",
                "zh-cn": "夜晚",
            },
            nadir: {
                en: "Midnight",
                de: "Mitternacht",
                ru: "Полночь",
                pt: "Meia-noite",
                nl: "Middernacht",
                fr: "Minuit",
                it: "Mezzanotte",
                es: "Medianoche",
                pl: "Północ",
                uk: "Північ",
                "zh-cn": "午夜",
            },
            nightEnd: {
                en: "Night end",
                de: "Ende der Nacht",
                ru: "Конец ночи",
                pt: "Fim da noite",
                nl: "Nacht einde",
                fr: "Fin de la nuit",
                it: "Fine della notte",
                es: "Fin de la noche",
                pl: "Koniec nocy",
                uk: "Кінець ночі",
                "zh-cn": "夜幕降临",
            },
            nauticalDawn: {
                en: "Nautical dawn",
                de: "Nautische Morgendämmerung",
                ru: "Морской рассвет",
                pt: "amanhecer náutico",
                nl: "Nautische dageraad",
                fr: "Aube nautique",
                it: "Alba nautica",
                es: "Amanecer náutico",
                pl: "Morski świt",
                uk: "Морський світанок",
                "zh-cn": "航海黎明",
            },
            dawn: {
                en: "Dawn",
                de: "Morgendämmerung",
                ru: "Рассвет",
                pt: "Alvorecer",
                nl: "Ochtendgloren",
                fr: "Aube",
                it: "Alba",
                es: "Amanecer",
                pl: "Świt",
                uk: "Світанок",
                "zh-cn": "黎明",
            },
        };
        return all[word][this.lang];
    }

    /**
     * @param lang Lang
     */
    public async createStates(lang: string): Promise<any> {
        this.lang = lang;
        this.adapter.log.info(`Create HTML states!`);
        let common: any = {};
        let val: ioBroker.State | null | undefined;
        common = {
            name: "HTML",
            desc: "HTML",
        };
        await this.createDataPoint("html", common, "folder");
        common = {
            type: "string",
            role: "level.color.rgb",
            name: {
                en: "Heading underlined color",
                de: "Heading unterstrichene Farbe",
                ru: "Заголовок подчеркнутый цвет",
                pt: "Cor sublinhada de cabeça",
                nl: "Vertaling:",
                fr: "Tête de couleur soulignée",
                it: "Intestazione colore sottolineato",
                es: "Cabeza de color subrayado",
                pl: "Głowa podkreślona koloru",
                uk: "Подається згідно з кольором",
                "zh-cn": "标题突出强调颜色",
            },
            desc: "Heading underlined color",
            read: true,
            write: true,
            def: "#ffffff",
        };
        await this.createDataPoint("html.headline_underlined_color", common, "state");
        val = await this.adapter.getStateAsync("html.headline_underlined_color");
        this.htmlVal.headline_underlined_color = val?.val;
        common = {
            type: "number",
            role: "value",
            name: {
                en: "Heading underlined",
                de: "Unterstrichen",
                ru: "Заголовок подчеркнут",
                pt: "Rubrica sublinhada",
                nl: "Ondersteuning",
                fr: "Heading underlined",
                it: "Denominazione sottolineata",
                es: "Encabezamiento subrayado",
                pl: "Headlong underlined",
                uk: "Подається згідно з",
                "zh-cn": "标题强调",
            },
            desc: "Heading underlined",
            read: true,
            write: true,
            def: 3,
            unit: "px",
        };
        await this.createDataPoint("html.headline_underlined", common, "state");
        val = await this.adapter.getStateAsync("html.headline_underlined");
        this.htmlVal.headline_underlined = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "Headline font weight",
                de: "Headline Schriftstärke",
                ru: "Вес шрифта заголовка",
                pt: "Peso da fonte do título",
                nl: "Hoofdlettertypegewicht",
                fr: "Poids de la police en tête",
                it: "Headline font peso",
                es: "Headline font weight",
                pl: "Masa czcionki nagłówka",
                uk: "Вага шрифту",
                "zh-cn": "头条字体重量",
            },
            desc: "Headline font weight",
            read: true,
            write: true,
            def: "normal",
            states: {
                normal: "normal",
                bold: "bold",
            },
        };
        await this.createDataPoint("html.headline_weight", common, "state");
        val = await this.adapter.getStateAsync("html.headline_weight");
        this.htmlVal.headline_weight = val?.val;
        common = {
            type: "number",
            role: "value",
            name: {
                en: "Headline font size",
                de: "Headline Schriftgröße",
                ru: "Размер шрифта Headline",
                pt: "Tamanho da fonte do título",
                nl: "Hoofdlijn lettertype",
                fr: "Headline font size",
                it: "Formato del carattere",
                es: "Tamaño de la fuente",
                pl: "Fontanny",
                uk: "Розмір основного шрифту",
                "zh-cn": "导 言",
            },
            desc: "Headline height",
            read: true,
            write: true,
            def: 16,
            unit: "px",
        };
        await this.createDataPoint("html.headline_font_size", common, "state");
        val = await this.adapter.getStateAsync("html.headline_font_size");
        this.htmlVal.headline_font_size = val?.val;
        common = {
            type: "number",
            role: "value",
            name: {
                en: "Headline height",
                de: "Kopfhöhe",
                ru: "Высота заголовка",
                pt: "Altura do título",
                nl: "Hoofdlijn lengte",
                fr: "Hauteur de la tête",
                it: "Altezza della testa",
                es: "Altura del título",
                pl: "Headline height",
                uk: "Висота лінії",
                "zh-cn": "标题高",
            },
            desc: "Headline height",
            read: true,
            write: true,
            def: 35,
            unit: "px",
        };
        await this.createDataPoint("html.headline_height", common, "state");
        val = await this.adapter.getStateAsync("html.headline_height");
        this.htmlVal.headline_height = val?.val;
        common = {
            type: "string",
            role: "level.color.rgb",
            name: {
                en: "Headline color",
                de: "Kopffarbe",
                ru: "Цвет заголовка",
                pt: "Cor do título",
                nl: "Hoofdlijn kleur",
                fr: "Couleur Headline",
                it: "Colore della testa",
                es: "Color de encabezado",
                pl: "Kolor",
                uk: "Колір лінії",
                "zh-cn": "标题",
            },
            desc: "Headline color",
            read: true,
            write: true,
            def: "#ffffff",
        };
        await this.createDataPoint("html.headline_color", common, "state");
        val = await this.adapter.getStateAsync("html.headline_color");
        this.htmlVal.headline_color = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "TOP text",
                de: "TOP-Text",
                ru: "ТОП-текст",
                pt: "Texto do TOP",
                nl: "Top",
                fr: "Texte TOP",
                it: "Testo TOP",
                es: "Texto de la página",
                pl: "Tekst TOP",
                uk: "Головна",
                "zh-cn": "案文",
            },
            desc: "TOP text",
            read: true,
            write: true,
            def: "your text",
        };
        await this.createDataPoint("html.top_text", common, "state");
        val = await this.adapter.getStateAsync("html.top_text");
        this.htmlVal.top_text = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "TOP font weight",
                de: "TOP Schriftstärke",
                ru: "TOP вес шрифта",
                pt: "Peso da fonte TOP",
                nl: "ToP font gewicht",
                fr: "Poids de police TOP",
                it: "TOP font peso",
                es: "TOP font weight",
                pl: "TOP",
                uk: "Максимальна вага шрифту",
                "zh-cn": "排 权",
            },
            desc: "TOP font weight",
            read: true,
            write: true,
            def: "normal",
            states: {
                normal: "normal",
                bold: "bold",
            },
        };
        await this.createDataPoint("html.top_font_weight", common, "state");
        val = await this.adapter.getStateAsync("html.top_font_weight");
        this.htmlVal.top_font_weight = val?.val;
        common = {
            type: "number",
            role: "value",
            name: {
                en: "TOP font size",
                de: "TOP Schriftgröße",
                ru: "TOP размер шрифта",
                pt: "Tamanho da fonte TOP",
                nl: "ToP font maat",
                fr: "Taille de police TOP",
                it: "Dimensione del carattere TOP",
                es: "Tamaño de fuente TOP",
                pl: "TOP",
                uk: "Розмір шрифту",
                "zh-cn": "排 度",
            },
            desc: "TOP font size",
            read: true,
            write: true,
            def: 20,
            unit: "px",
        };
        await this.createDataPoint("html.top_font_size", common, "state");
        val = await this.adapter.getStateAsync("html.top_font_size");
        this.htmlVal.top_font_size = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "TOP font",
                de: "TOP Schriftart",
                ru: "TOP шрифт",
                pt: "Fonte TOP",
                nl: "Top font",
                fr: "Police TOP",
                it: "TOP font",
                es: "Fuente TOP",
                pl: "TOP",
                uk: "Топ шрифт",
                "zh-cn": "三、结 论",
            },
            desc: "TOP font",
            read: true,
            write: true,
            def: "Helvetica",
        };
        await this.createDataPoint("html.top_font_family", common, "state");
        val = await this.adapter.getStateAsync("html.top_font_family");
        this.htmlVal.top_font_family = val?.val;
        common = {
            type: "string",
            role: "level.color.rgb",
            name: {
                en: "TOP text color",
                de: "TOP Textfarbe",
                ru: "ТОП цвет текста",
                pt: "Cor de texto TOP",
                nl: "Top sms kleur",
                fr: "Couleur du texte TOP",
                it: "Colore del testo TOP",
                es: "Color de texto",
                pl: "Okładka",
                uk: "Колір тексту",
                "zh-cn": "案文",
            },
            desc: "TOP text color",
            read: true,
            write: true,
            def: "#ffffff",
        };
        await this.createDataPoint("html.top_text_color", common, "state");
        val = await this.adapter.getStateAsync("html.top_text_color");
        this.htmlVal.top_text_color = val?.val;
        common = {
            type: "string",
            role: "level.color.rgb",
            name: {
                en: "TAG <table> header linear color 2.",
                de: "TAG <table> Header lineare Farbe 2.",
                ru: "TAG <table> линейный цвет 2.",
                pt: "Cor linear de cabeçalho TAG <table> 2.",
                nl: "Tag <table> hoofd lineaire kleur 2.",
                fr: "Couleur linéaire TAG <table> en-tête 2.",
                it: "TAG <table> intestazione colore lineare 2.",
                es: "TAG <table> Header linear color 2.",
                pl: "TAG <table> koloru liniowego 2.",
                uk: "TAG <table> заголовок лінійного кольору 2.",
                "zh-cn": "TAG <table>头寸ar颜色2.",
            },
            desc: "TAG <table> header linear color 2.",
            read: true,
            write: true,
            def: "#BDBDBD",
        };
        await this.createDataPoint("html.header_linear_color_2", common, "state");
        val = await this.adapter.getStateAsync("html.header_linear_color_2");
        this.htmlVal.header_linear_color_2 = val?.val;
        common = {
            type: "string",
            role: "level.color.rgb",
            name: {
                en: "TAG <table> header linear color 1.",
                de: "TAG <table> Header lineare Farbe 1.",
                ru: "TAG <table> линейный цвет 1.",
                pt: "Cor linear de cabeçalho TAG <table> 1.",
                nl: "Tag <table> hoofd lineaire kleur 1.",
                fr: "Couleur linéaire TAG <table> en-tête 1.",
                it: "TAG <table> intestazione colore lineare 1.",
                es: "TAG <table> Header linear color 1.",
                pl: "TAG <table> koloru liniowego 1.",
                uk: "TAG <table> заголовок лінійного кольору 1.",
                "zh-cn": "TAG <table>头寸ar颜色1.",
            },
            desc: "TAG <table> header linear color 1.",
            read: true,
            write: true,
            def: "#BDBDBD",
        };
        await this.createDataPoint("html.header_linear_color_1", common, "state");
        val = await this.adapter.getStateAsync("html.header_linear_color_1");
        this.htmlVal.header_linear_color_1 = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "TAG <table> header font family.",
                de: "TAG <table> Header Schriftfamilie.",
                ru: "TAG <table> заголовок семейства шрифтов.",
                pt: "TAG <table> header font family.",
                nl: "TAG-lettertypefamilie <table>.",
                fr: "Famille de polices d'en-tête TAG <table>.",
                it: "TAG <table> intestazione famiglia font.",
                es: "TAG <table> header font family.",
                pl: "Rodzina czcionek TAG <table>.",
                uk: "TAG <table> головки сімейства шрифтів.",
                "zh-cn": "TAG<table>头字体家族.",
            },
            desc: "TAG <table> header font family.",
            read: true,
            write: true,
            def: "Helvetica",
        };
        await this.createDataPoint("html.header_font_family", common, "state");
        val = await this.adapter.getStateAsync("html.header_font_family");
        this.htmlVal.header_font_family = val?.val;
        common = {
            type: "number",
            role: "value",
            name: {
                en: "TAG <table> header font size.",
                de: "TAG <table> Header Schriftgröße.",
                ru: "TAG <table> размер шрифта.",
                pt: "TAG <table> tamanho da fonte do cabeçalho.",
                nl: "Tag <table> koper lettertype.",
                fr: "TAG <table> header font size.",
                it: "TAG <table> intestazione formato carattere.",
                es: "TAG <table> header font size.",
                pl: "TAG <table> – typ czcionki.",
                uk: "TAG <table> розмір заголовка.",
                "zh-cn": "TAG <table>名导师规模。.",
            },
            desc: "TAG <table> header font size.",
            read: true,
            write: true,
            def: 15,
            unit: "px",
        };
        await this.createDataPoint("html.header_font_size", common, "state");
        val = await this.adapter.getStateAsync("html.header_font_size");
        this.htmlVal.header_font_size = val?.val;
        common = {
            type: "number",
            role: "value",
            name: {
                en: "TAG <table> header border.",
                de: "TAG <table> Kopfgrenze.",
                ru: "TAG <table> границы заголовка.",
                pt: "TAG <table> fronteira de cabeçalho.",
                nl: "TAG <table> hoofdgrens.",
                fr: "TAG <table> tête frontière.",
                it: "TAG <table> bordo intestazione.",
                es: "TAG <table> frontera de cabecera.",
                pl: "TAG <table> – granica głodowa.",
                uk: "TAG <table> заголовок кордону.",
                "zh-cn": "TAG <table>头寸边界。.",
            },
            desc: "TAG <table> header border.",
            read: true,
            write: true,
            def: 2,
            unit: "px",
        };
        await this.createDataPoint("html.header_border", common, "state");
        val = await this.adapter.getStateAsync("html.header_border");
        this.htmlVal.header_border = val?.val;
        common = {
            type: "string",
            role: "level.color.rgb",
            name: {
                en: "TAG <table> header border color.",
                de: "TAG <table> Header Randfarbe.",
                ru: "TAG <table> цвет границы заголовка.",
                pt: "TAG <table> cor da borda do cabeçalho.",
                nl: "TAG <table> hoofd grenskleur.",
                fr: "TAG <table> couleur de la bordure d'en-tête.",
                it: "TAG <table> intestazione bordo colore.",
                es: "TAG <table> de color de borde de cabecera.",
                pl: "TAG <table> – kolor graniczny.",
                uk: "TAG <table> заголовок прикордонного кольору.",
                "zh-cn": "TAG <table>头邻。.",
            },
            desc: "TAG <table> header border color.",
            read: true,
            write: true,
            def: "#424242",
        };
        await this.createDataPoint("html.header_tag_border_color", common, "state");
        val = await this.adapter.getStateAsync("html.header_tag_border_color");
        this.htmlVal.header_tag_border_color = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "TAG <table> header width (e.g. auto, 100% or 1080px).",
                de: "TAG <table> Kopfbreite (z.B. Auto, 100% oder 1080px.).",
                ru: "TAG <table> ширина заголовка (например, авто, 100% или 1080px.).",
                pt: "TAG <table> largura do cabeçalho (por exemplo, auto, 100% ou 1080px.).",
                nl: "TAG <table> koper width (e.g auto, 100% of 1080px).",
                fr: "Largeur d'en-tête TAG <table> (p. ex. auto, 100% ou 1080px.).",
                it: "Larghezza intestazione TAG <table> (ad esempio auto, 100% o 1080px.).",
                es: "TAG <table> ancho de cabecera (por ejemplo auto, 100% o 1080px.).",
                pl: "TAG <table> (np. auto, 100% lub 1080 KM).",
                uk: "TAG <table> ширина заголовка (наприклад, автоматичний, 100% або 1080px).",
                "zh-cn": "TAG <table> 头巾(如汽车、100%或1080px).",
            },
            desc: "TAG <table> header width (e.g. auto, 100% or 1080px).",
            read: true,
            write: true,
            def: "auto",
        };
        await this.createDataPoint("html.header_width", common, "state");
        val = await this.adapter.getStateAsync("html.header_width");
        this.htmlVal.header_width = val?.val;
        common = {
            type: "number",
            role: "value",
            name: {
                en: "TAG <table> padding",
                de: "TAG <table> Padding",
                ru: "TAG <table> Padding",
                pt: "TAG <table> padding",
                nl: "TAG <table> opvulling",
                fr: "Rembourrage TAG <table>",
                it: "TAG <table> imbottitura",
                es: "Acolchado <table> TAG",
                pl: "TAG <table> wyściełanie",
                uk: "TAG <table> наповнювач",
                "zh-cn": "TAG <table> 垫装",
            },
            desc: "TAG <table> padding",
            read: true,
            write: true,
            def: 6,
            unit: "px",
        };
        await this.createDataPoint("html.table_tag_cell", common, "state");
        val = await this.adapter.getStateAsync("html.table_tag_cell");
        this.htmlVal.table_tag_cell = val?.val;
        common = {
            type: "string",
            role: "level.color.rgb",
            name: {
                en: "TAG <table> border color",
                de: "TAG <table> Grenzfarbe",
                ru: "TAG <table> пограничный цвет",
                pt: "TAG <table> cor da borda",
                nl: "TAG <tabel> randkleur",
                fr: "Couleur de la bordure de TAG <table>",
                it: "TAG <table> colore di confine",
                es: "TAG - color de borde ajustable",
                pl: "TAG < table > barwa graniczna",
                uk: "TAG <table> бордовий колір",
                "zh-cn": "TAG < table > 边框颜色",
            },
            desc: "TAG <table> border color",
            read: true,
            write: true,
            def: "#424242",
        };
        await this.createDataPoint("html.table_tag_border_color", common, "state");
        val = await this.adapter.getStateAsync("html.table_tag_border_color");
        this.htmlVal.table_tag_border_color = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "TAG <table> text align",
                de: "TAG <table> Text ausrichten",
                ru: "TAG <table> текст",
                pt: "TAG <table> alinhamento de texto",
                nl: "TAG <table> sms-align",
                fr: "TAG <table> texte aligné",
                it: "TAG <table> testo allineare",
                es: "TAG <table> texto alineado",
                pl: "TAG <table> dopasował",
                uk: "TAG <table> текст вирівнювання",
                "zh-cn": "TAG<table>案文",
            },
            desc: "TAG <table> width",
            read: true,
            write: true,
            def: "center",
            states: ["center", "left", "right", "auto"],
        };
        await this.createDataPoint("html.table_tag_text_align", common, "state");
        val = await this.adapter.getStateAsync("html.table_tag_text_align");
        this.htmlVal.table_tag_text_align = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "TAG <table> width (e.g. auto or 100px)",
                de: "TAG <table> Breite (z.B. Auto oder 100px)",
                ru: "TAG <table> ширина (например, авто или 100px)",
                pt: "TAG <table> largura (por exemplo, auto ou 100px)",
                nl: "TAG <table> width (e.g auto of 100px)",
                fr: "TAG <table> largeur (p. ex. auto ou 100px)",
                it: "Larghezza TAG <table> (ad esempio auto o 100px)",
                es: "TAG <table> ancho (por ejemplo auto o 100px)",
                pl: "TAG <table> szerokość (np. auto lub 100 KM)",
                uk: "TAG <table> ширина (наприклад, авто або 100px)",
                "zh-cn": "TAG<table>妻子(如汽车或100px)",
            },
            desc: "TAG <table> width (e.g. auto or 100px)",
            read: true,
            write: true,
            def: "auto",
        };
        await this.createDataPoint("html.table_tag_width", common, "state");
        val = await this.adapter.getStateAsync("html.table_tag_width");
        this.htmlVal.table_tag_width = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "TAG <table> width (e.g. auto or 100px)",
                de: "TAG <table> Breite (z.B. Auto oder 100px)",
                ru: "TAG <table> ширина (например, авто или 100px)",
                pt: "TAG <table> largura (por exemplo, auto ou 100px)",
                nl: "TAG <table> width (e.g auto of 100px)",
                fr: "TAG <table> largeur (p. ex. auto ou 100px)",
                it: "Larghezza TAG <table> (ad esempio auto o 100px)",
                es: "TAG <table> ancho (por ejemplo auto o 100px)",
                pl: "TAG <table> szerokość (np. auto lub 100 KM)",
                uk: "TAG <table> ширина (наприклад, авто або 100px)",
                "zh-cn": "TAG<table>妻子(如汽车或100px)",
            },
            desc: "TAG <table> width (e.g. auto or 100px)",
            read: true,
            write: true,
            def: "auto",
        };
        await this.createDataPoint("html.table_tag_width", common, "state");
        val = await this.adapter.getStateAsync("html.table_tag_width");
        this.htmlVal.table_tag_width = val?.val;
        common = {
            type: "string",
            role: "level.color.rgb",
            name: {
                en: "TAG <td> border color",
                de: "TAG <td> Grenzfarbe",
                ru: "TAG <td> пограничный цвет",
                pt: "TAG <td> cor da borda",
                nl: "TAG <td> randkleur",
                fr: "Couleur de la bordure de TAG <td>",
                it: "TAG <td> colore di confine",
                es: "TAG <td> color de borde",
                pl: "TAG <td> kolor granic",
                uk: "TAG <td> бордовий колір",
                "zh-cn": "TAG <td> 边框颜色",
            },
            desc: "TAG <td> border color",
            read: true,
            write: true,
            def: "#424242",
        };
        await this.createDataPoint("html.td_tag_border_color", common, "state");
        val = await this.adapter.getStateAsync("html.td_tag_border_color");
        this.htmlVal.td_tag_border_color = val?.val;
        common = {
            type: "number",
            role: "value",
            name: {
                en: "TAG <td> border bottom",
                de: "TAG <td> Randboden",
                ru: "TAG <td> пограничное дно",
                pt: "TAG <td> fronteira inferior",
                nl: "TAG <td> rand onder",
                fr: "TAG <td> fond de bordure",
                it: "TAG <td> fondo di confine",
                es: "TAG <td> inferior de la frontera",
                pl: "TAG <td> dolna granica",
                uk: "TAG <td> бордовий дно",
                "zh-cn": "TAG <td> 边框底部",
            },
            desc: "TAG <td> border bottom",
            read: true,
            write: true,
            def: 1,
            unit: "px",
        };
        await this.createDataPoint("html.td_tag_border_bottom", common, "state");
        val = await this.adapter.getStateAsync("html.td_tag_border_bottom");
        this.htmlVal.td_tag_border_bottom = val?.val;
        common = {
            type: "number",
            role: "value",
            name: {
                en: "TAG <td> border right",
                de: "TAG <td> Grenze rechts",
                ru: "TAG <td> пограничное право",
                pt: "TAG <td> fronteira direita",
                nl: "TAG <td> randrechts",
                fr: "TAG <td> frontière droite",
                it: "TAG <td> diritto di frontiera",
                es: "TAG <td> border right",
                pl: "TAG <td> prawo graniczne",
                uk: "TAG <td> кордон прямо",
                "zh-cn": "TAG <td> 右边边框",
            },
            desc: "TAG <td> border right",
            read: true,
            write: true,
            def: 1,
            unit: "px",
        };
        await this.createDataPoint("html.td_tag_border_right", common, "state");
        val = await this.adapter.getStateAsync("html.td_tag_border_right");
        this.htmlVal.td_tag_border_right = val?.val;
        common = {
            type: "number",
            role: "value",
            name: {
                en: "TAG <td> padding",
                de: "TAG <td> Padding",
                ru: "TAG <td> Padding",
                pt: "TAG <td> padding",
                nl: "TAG <td> opvulling",
                fr: "Rembourrage TAG <td>",
                it: "TAG <td> imbottitura",
                es: "Acolchado <td> TAG",
                pl: "TAG < td > wyściełanie",
                uk: "TAG <td> наповнювач",
                "zh-cn": "TAG <td> 垫装",
            },
            desc: "TAG <td> padding",
            read: true,
            write: true,
            def: 6,
            unit: "px",
        };
        await this.createDataPoint("html.td_tag_cell", common, "state");
        val = await this.adapter.getStateAsync("html.td_tag_cell");
        this.htmlVal.td_tag_cell = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "Text align <p>",
                de: "Textausrichtung <p>",
                ru: "Текстовое выравнивание <p>",
                pt: "Alinhamento de texto <p>",
                nl: "Tekstuitlijning <p>",
                fr: "Alignement du texte <p>",
                it: "Allineamento del testo <p>",
                es: "Texto alineado <p>",
                pl: "Tekst wyrównania <p>",
                uk: "Текстове вирівнювання <p>",
                "zh-cn": "文本对齐<p>",
            },
            desc: "Text align <p>",
            read: true,
            write: true,
            def: "center",
            states: ["center", "left", "right", "auto"],
        };
        await this.createDataPoint("html.p_tag_text_algin", common, "state");
        val = await this.adapter.getStateAsync("html.p_tag_text_algin");
        this.htmlVal.p_tag_text_algin = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "Font color enabled",
                de: "Schriftfarbe aktiviert",
                ru: "Встроенный цвет",
                pt: "Cor da fonte habilitada",
                nl: "Lettertypekleur ingeschakeld",
                fr: "Couleur de la police activée",
                it: "Colore del carattere abilitato",
                es: "Color de fuente habilitado",
                pl: "Kolor czcionki włączony",
                uk: "Увімкнути колір шрифту",
                "zh-cn": "字体已启用",
            },
            desc: "Font color enabled",
            read: true,
            write: true,
            def: "yellow",
        };
        await this.createDataPoint("html.font_color_text_enabled", common, "state");
        val = await this.adapter.getStateAsync("html.font_color_text_enabled");
        this.htmlVal.font_color_text_enabled = val?.val;
        common = {
            type: "boolean",
            role: "button",
            name: {
                en: "Update",
                de: "Aktualisierung",
                ru: "Обновление",
                pt: "Atualização",
                nl: "Bijwerken",
                fr: "Mise à jour",
                it: "Aggiornamento",
                es: "Actualización",
                pl: "Aktualizacja",
                uk: "Новини",
                "zh-cn": "更新",
            },
            desc: "Update",
            read: false,
            write: true,
            def: false,
        };
        await this.createDataPoint("html.update", common, "state");
        common = {
            type: "string",
            role: "state",
            name: {
                en: "Font color disabled",
                de: "Schriftfarbe deaktiviert",
                ru: "Цвет фона отключен",
                pt: "Cor da fonte desativada",
                nl: "Lettertypekleur uitgeschakeld",
                fr: "Couleur de la police désactivée",
                it: "Colore del carattere disattivato",
                es: "Color de la fuente deshabilitado",
                pl: "Kolor czcionki wyłączony",
                uk: "Колір шрифту вимкнено",
                "zh-cn": "字体已禁用",
            },
            desc: "Font color disabled",
            read: true,
            write: true,
            def: "red",
        };
        await this.createDataPoint("html.font_color_text_disabled", common, "state");
        val = await this.adapter.getStateAsync("html.font_color_text_disabled");
        this.htmlVal.font_color_text_disabled = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "Font color weekdays enabled",
                de: "Schriftfarbe Wochentage aktiviert",
                ru: "Цвет пента включен",
                pt: "Dia da semana colorida da fonte habilitado",
                nl: "Lettertypekleur weekdagen ingeschakeld",
                fr: "Couleur de la police en semaine activée",
                it: "Colore del carattere giorni della settimana abilitati",
                es: "Días semanales de color de fuente habilitados",
                pl: "Kolor czcionki dni tygodnia włączone",
                uk: "Ввімкнути кольорові дати",
                "zh-cn": "启用字体颜色工作日",
            },
            desc: "Font color weekdays enabled",
            read: true,
            write: true,
            def: "yellow",
        };
        await this.createDataPoint("html.font_color_weekdays_enabled", common, "state");
        val = await this.adapter.getStateAsync("html.font_color_weekdays_enabled");
        this.htmlVal.font_color_weekdays_enabled = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "Font color weekdays disabled",
                de: "Schriftfarbe Wochentage deaktiviert",
                ru: "Цвет пента будня отключен",
                pt: "Dia da semana de cor da fonte desativado",
                nl: "Lettertypekleur weekdagen uitgeschakeld",
                fr: "Police couleur en semaine désactivée",
                it: "Colore del carattere giorni della settimana disabilitati",
                es: "Font color weekdays disabled",
                pl: "Kolor czcionki dni tygodnia wyłączone",
                uk: "Фонтан кольоровий тиждень відключення",
                "zh-cn": "字体颜色工作日已禁用",
            },
            desc: "Font color weekdays disabled",
            read: true,
            write: true,
            def: "red",
        };
        await this.createDataPoint("html.font_color_weekdays_disabled", common, "state");
        val = await this.adapter.getStateAsync("html.font_color_weekdays_disabled");
        this.htmlVal.font_color_weekdays_disabled = val?.val;
        const states = [
            "🟡",
            "⚪",
            "🟤",
            "⚫",
            "🔴",
            "🔵",
            "🟢",
            "🟠",
            "🔵",
            "🟣",
            "✅",
            "❌",
            "⭕",
            "⏱",
            "💀",
            "👍",
            "👎",
            "📑",
            "💲",
            "👀",
        ];
        common = {
            type: "string",
            role: "state",
            name: {
                en: "State comparison activated",
                de: "Zustandsvergleich aktiviert",
                ru: "Сравнение состояний активировано",
                pt: "Comparação de estados ativada",
                nl: "Statusvergelijking geactiveerd",
                fr: "Comparaison d'état activée",
                it: "Confronto di stato attivato",
                es: "Comparación de estados activada",
                pl: "Porównanie stanów zostało aktywowane",
                uk: "Порівняння станів активовано",
                "zh-cn": "状态比较已激活",
            },
            desc: "State comparison activated",
            read: true,
            write: true,
            def: "🟢",
            states: states,
        };
        await this.createDataPoint("html.icon_state_check_yes", common, "state");
        val = await this.adapter.getStateAsync("html.icon_state_check_yes");
        this.htmlVal.icon_state_check_yes = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "State comparison disabled",
                de: "Statusvergleich deaktiviert",
                ru: "Сравнение состояний отключено",
                pt: "Comparação de estados desabilitada",
                nl: "Staatsvergelijking uitgeschakeld",
                fr: "Comparaison d'état désactivée",
                it: "Confronto di stato disabilitato",
                es: "Comparación de estados deshabilitada",
                pl: "Porównanie stanów wyłączone",
                uk: "Порівняння станів вимкнено",
                "zh-cn": "状态比较已禁用",
            },
            desc: "State comparison disabled",
            read: true,
            write: true,
            def: "🔴",
            states: states,
        };
        await this.createDataPoint("html.icon_state_check_no", common, "state");
        val = await this.adapter.getStateAsync("html.icon_state_check_no");
        this.htmlVal.icon_state_check_no = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "Icon for TRUE",
                de: "Icon für TRUE",
                ru: "Икона для TRUE",
                pt: "Ícone para TRUE",
                nl: "Pictogram voor WAAR",
                fr: "Icône pour TRUE",
                it: "Icona per TRUE",
                es: "Icono para TRUE",
                pl: "Ikona dla TRUE",
                uk: "Ікона для TRUE",
                "zh-cn": "TRUE 图标",
            },
            desc: "Icon for TRUE",
            read: true,
            write: true,
            def: "🟡",
            states: states,
        };
        await this.createDataPoint("html.icon_true", common, "state");
        val = await this.adapter.getStateAsync("html.icon_true");
        this.htmlVal.icon_true = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "Icon for FALSE",
                de: "Icon für FALSE",
                ru: "Икона для FALSE",
                pt: "Ícone para FALSE",
                nl: "Pictogram voor FALSE",
                fr: "Icône pour FALSE",
                it: "Icona per FALSE",
                es: "Icono para FALSE",
                pl: "Ikona FALSE",
                uk: "Ікона під FALSE",
                "zh-cn": "FALSE 图标",
            },
            desc: "Icon for FALSE",
            read: true,
            write: true,
            def: "⚪",
            states: states,
        };
        await this.createDataPoint("html.icon_false", common, "state");
        val = await this.adapter.getStateAsync("html.icon_false");
        this.htmlVal.icon_false = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "Switch symbol",
                de: "Schaltersymbol",
                ru: "Символ переключателя",
                pt: "Símbolo de interruptor",
                nl: "Switch symbool",
                fr: "Symbole de commutation",
                it: "Simbolo di commutazione",
                es: "Signatura del interruptor",
                pl: "Symbol przełącznika",
                uk: "Символ перемикання",
                "zh-cn": "切换符号",
            },
            desc: "Switch symbol",
            read: true,
            write: true,
            def: "⏱",
            states: states,
        };
        await this.createDataPoint("html.icon_switch_symbol", common, "state");
        val = await this.adapter.getStateAsync("html.icon_switch_symbol");
        this.htmlVal.icon_switch_symbol = val?.val;
        const text = ["Schedule", "Devices", "Switch", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
        for (let i = 1; i < 11; i++) {
            common = {
                type: "string",
                role: "state",
                name: {
                    en: `Column ${i} align`,
                    de: `Spalte ${i} ausrichten`,
                    ru: `Колонка ${i}`,
                    pt: `Coluna ${i}`,
                    nl: `Kolom ${i} uitlijnen`,
                    fr: `Colonne ${i} aligner`,
                    it: `Colonna ${i} allineare`,
                    es: `Columna ${i} alinear`,
                    pl: `Kolumna ${i} wyrównać`,
                    uk: `Колонка ${i} вирівнювання`,
                    "zh-cn": `列 ${i} 对齐`,
                },
                desc: `column ${i} align`,
                read: true,
                write: true,
                def: "center",
                states: ["center", "left", "right", "auto"],
            };
            await this.createDataPoint(`html.column_align_${i.toString().padStart(2, "0")}`, common, "state");
            val = await this.adapter.getStateAsync(`html.column_align_${i.toString().padStart(2, "0")}`);
            this.htmlVal[`column_align_${i.toString().padStart(2, "0")}`] = val?.val;
            common = {
                type: "string",
                role: "state",
                name: {
                    en: `Column ${i} width (auto, px or %)`,
                    de: `Spalte ${i} Breite (auto, px oder %)`,
                    ru: `Колонка ${i} Ширина (авто, px или %)`,
                    pt: `Coluna ${i} largura (auto, px ou %)`,
                    nl: `Kolom ${i} breedte (auto, px of %)`,
                    fr: `Colonne {i} largeur (auto, px ou %)`,
                    it: `Colonna ${i} larghezza (auto, px o %)`,
                    es: `Columna ${i} ancho (auto, px o %)`,
                    pl: `Kolumna ${i} szerokość (auto, px lub%)`,
                    uk: `Колонка ${i} ширина (auto, px або %)`,
                    "zh-cn": `栏 ${i} 宽度 (自动、 px 或%)`,
                },
                desc: `Column ${i} width (auto, px or %)`,
                read: true,
                write: true,
                def: "auto",
            };
            await this.createDataPoint(`html.column_width_${i.toString().padStart(2, "0")}`, common, "state");
            val = await this.adapter.getStateAsync(`html.column_width_${i.toString().padStart(2, "0")}`);
            this.htmlVal[`column_width_${i.toString().padStart(2, "0")}`] = val?.val;
            common = {
                type: "string",
                role: "state",
                name: {
                    en: `Column ${i} text`,
                    de: `Spalte ${i} Text`,
                    ru: `Колонка ${i} текст`,
                    pt: `Coluna ${i} texto`,
                    nl: `Kolom ${i} tekst`,
                    fr: `Texte de la colonne ${i}`,
                    it: `Colonna ${i} testo`,
                    es: `Columna ${i} texto`,
                    pl: `Tekst w kolumnie ${i}`,
                    uk: `Колонка ${i} текст`,
                    "zh-cn": `列 ${i} 文本`,
                },
                desc: `Column ${i} text`,
                read: true,
                write: true,
                def: text[i - 1],
            };
            await this.createDataPoint(`html.column_text_${i.toString().padStart(2, "0")}`, common, "state");
            val = await this.adapter.getStateAsync(`html.column_text_${i.toString().padStart(2, "0")}`);
            this.htmlVal[`column_text_${i.toString().padStart(2, "0")}`] = val?.val;
            common = {
                type: "string",
                role: "state",
                name: {
                    en: `Alignment of row in column ${i}`,
                    de: `Ausrichtung der Zeile in Spalte ${i}`,
                    ru: `Размещение строки в колонке ${i}`,
                    pt: `Alinhamento da linha na coluna ${i}`,
                    nl: `Uitlijning van rij in kolom ${i}`,
                    fr: `Alignement de la ligne dans la colonne ${i}`,
                    it: `Allineamento della riga nella colonna ${i}`,
                    es: `Alineación de fila en la columna ${i}`,
                    pl: `Dostosowanie wiersza w kolumnie ${i}`,
                    uk: `Вирівнювання ряду в колонці ${i}`,
                    "zh-cn": `栏 ${i} 行对齐`,
                },
                desc: `Alignment of row in column ${i}`,
                read: true,
                write: true,
                def: "left",
                states: ["center", "left", "right", "auto"],
            };
            await this.createDataPoint(`html.column_align_row_${i.toString().padStart(2, "0")}`, common, "state");
            val = await this.adapter.getStateAsync(`html.column_align_row_${i.toString().padStart(2, "0")}`);
            this.htmlVal[`column_align_row_${i.toString().padStart(2, "0")}`] = val?.val;
        }
        common = {
            type: "string",
            role: "state",
            name: {
                en: "Background color (even)",
                de: "Hintergrundfarbe (gerade)",
                ru: "Фоновый цвет (даже)",
                pt: "Cor de fundo (even)",
                nl: "Achtergrondkleur (even)",
                fr: "Couleur de fond (même)",
                it: "Colore sfondo (anche)",
                es: "Color de fondo (incluso)",
                pl: "Kolor tła (parzysty)",
                uk: "Колір фону (навіть)",
                "zh-cn": "背景颜色( 偶数)",
            },
            desc: "Background color (even)",
            read: true,
            write: true,
            def: "#1E1E1E",
        };
        await this.createDataPoint("html.background_color_even", common, "state");
        val = await this.adapter.getStateAsync("html.background_color_even");
        this.htmlVal.background_color_even = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "Background color (odd)",
                de: "Hintergrundfarbe (ungerade)",
                ru: "Фоновый цвет (odd)",
                pt: "Cor de fundo (odd)",
                nl: "Achtergrondkleur (odd)",
                fr: "Couleur de fond (odd)",
                it: "Colore dello sfondo (odd)",
                es: "Color de fondo (odd)",
                pl: "Kolor tła (nieparzysty)",
                uk: "Колір фону (од)",
                "zh-cn": "背景颜色( 奇数)",
            },
            desc: "Background color (odd)",
            read: true,
            write: true,
            def: "#18171C",
        };
        await this.createDataPoint("html.background_color_odd", common, "state");
        val = await this.adapter.getStateAsync("html.background_color_odd");
        this.htmlVal.background_color_odd = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "Background color trigger",
                de: "Hintergrundfarbe Trigger",
                ru: "Фоновый цвет триггер",
                pt: "Gatilho de cor de fundo",
                nl: "Achtergrondkleur",
                fr: "Déclencheur de couleur de fond",
                it: "Innesco del colore di sfondo",
                es: "Color de fondo disparador",
                pl: "Kolor tła wyzwalacz",
                uk: "Підземний колірний тригер",
                "zh-cn": "背景颜色触发",
            },
            desc: "Background color trigger",
            read: true,
            write: true,
            def: "#000000",
        };
        await this.createDataPoint("html.background_color_trigger", common, "state");
        val = await this.adapter.getStateAsync("html.background_color_trigger");
        this.htmlVal.background_color_trigger = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "Background color body",
                de: "Hintergrundfarbe Body",
                ru: "Фоновый цвет тела",
                pt: "Corpo de cor de fundo",
                nl: "Achtergrondkleur",
                fr: "Corps de couleur de fond",
                it: "Corpo di colore di sfondo",
                es: "Cuerpo de color de fondo",
                pl: "Kolor tła ciała",
                uk: "Підземний колір тіла",
                "zh-cn": "背景颜色正文",
            },
            desc: "Background color body",
            read: true,
            write: true,
            def: "#000000",
        };
        await this.createDataPoint("html.background_color_body", common, "state");
        val = await this.adapter.getStateAsync("html.background_color_body");
        this.htmlVal.background_color_body = val?.val;
        common = {
            type: "boolean",
            role: "switch",
            name: {
                en: "Disable div.containers for jarvis",
                de: "Div.container für Jarvis deaktivieren",
                ru: "Отключить div.containers для jarvis",
                pt: "Desativar div.containers para jarvis",
                nl: "Disable div-containers",
                fr: "Disable div.containers for jarvis",
                it: "Disabilita div.containers per jarvis",
                es: "Desactivar div.containers para jarvis",
                pl: "Niezdolne div.containery dla jarvisów",
                uk: "Вимкнені див.контейнери для бані",
                "zh-cn": "A. 可以区分的 div. jarvis的拘留者",
            },
            desc: "Disable div.containers for jarvis",
            read: true,
            write: true,
            def: false,
        };
        await this.createDataPoint("html.jarvis", common, "state");
        val = await this.adapter.getStateAsync("html.jarvis");
        this.htmlVal.jarvis = val?.val;
        common = {
            type: "string",
            role: "state",
            name: {
                en: "Weekdays mouseover color",
                de: "Wochentage Mausover Farbe",
                ru: "Цвет мышки",
                pt: "Semanas mouseover cor",
                nl: "Weekdagen muisover kleur",
                fr: "La couleur de la souris en semaine",
                it: "I giorni feriali il colore del mouseover",
                es: "Días semanales ratónover color",
                pl: "Cotygodniowy kolor mouseover",
                uk: "День народження Колір",
                "zh-cn": "周日鼠标翻转颜色",
            },
            desc: "Weekdays mouseover color",
            read: true,
            write: true,
            def: "blue",
        };
        await this.createDataPoint("html.background_color_weekdays_hover", common, "state");
        val = await this.adapter.getStateAsync("html.background_color_weekdays_hover");
        this.htmlVal.background_color_weekdays_hover = val?.val;
        common = {
            type: "string",
            role: "html",
            name: {
                en: "HTML code",
                de: "HTML-Code",
                ru: "HTML код",
                pt: "Código HTML",
                nl: "HTML-code",
                fr: "Code HTML",
                it: "Codice HTML",
                es: "Código HTML",
                pl: "Kod HTML",
                uk: "Код HTML",
                "zh-cn": "HTML 代码",
            },
            desc: "HTML code",
            read: true,
            write: true,
            def: "",
        };
        await this.createDataPoint("html.html_code", common, "state");
        val = await this.adapter.getStateAsync("html.html_code");
        this.htmlVal.html_code = val?.val;
    }

    private loadTitle(val: string): Promise<string> {
        const lang: any = {
            activated: {
                en: "State comparison activated",
                de: "Zustandsvergleich aktiviert",
                ru: "Сравнение состояний активировано",
                pt: "Comparação de estados ativada",
                nl: "Statusvergelijking geactiveerd",
                fr: "Comparaison d'état activée",
                it: "Confronto di stato attivato",
                es: "Comparación de estados activada",
                pl: "Porównanie stanów zostało aktywowane",
                uk: "Порівняння станів активовано",
                "zh-cn": "状态比较已激活",
            },
            disabled: {
                en: "State comparison disabled",
                de: "Statusvergleich deaktiviert",
                ru: "Сравнение состояний отключено",
                pt: "Comparação de estados desabilitada",
                nl: "Staatsvergelijking uitgeschakeld",
                fr: "Comparaison d'état désactivée",
                it: "Confronto di stato disabilitato",
                es: "Comparación de estados deshabilitada",
                pl: "Porównanie stanów wyłączone",
                uk: "Порівняння станів вимкнено",
                "zh-cn": "状态比较已禁用",
            },
        };
        return lang[val][this.lang];
    }

    private async createDataPoint(ident: string, common: any, types: any, native: any = null): Promise<any> {
        try {
            const nativvalue = !native ? { native: {} } : { native: native };
            const obj = await this.adapter.getObjectAsync(ident);
            const objs: any = obj;
            if (!objs) {
                await this.adapter
                    .setObjectNotExistsAsync(ident, {
                        type: types,
                        common: common,
                        ...nativvalue,
                    })
                    .catch(error => {
                        this.adapter.log.warn(`createDataPoint: ${error}`);
                    });
                if (common.def != null) {
                    await this.adapter.setState(ident, { val: common.def, ack: true });
                }
            } else {
                let ischange = false;
                if (Object.keys(objs.common).length == Object.keys(common).length) {
                    for (const key in common) {
                        if (objs.common[key] == null) {
                            ischange = true;
                            break;
                        } else if (JSON.stringify(objs.common[key]) != JSON.stringify(common[key])) {
                            ischange = true;
                            break;
                        }
                    }
                } else {
                    ischange = true;
                }
                if (JSON.stringify(objs.type) != JSON.stringify(types)) {
                    ischange = true;
                }
                if (native) {
                    if (Object.keys(objs.native).length == Object.keys(nativvalue.native).length) {
                        for (const key in objs.native) {
                            if (nativvalue.native[key] == null) {
                                ischange = true;
                                delete objs.native;
                                objs.native = native;
                                break;
                            } else if (JSON.stringify(objs.native[key]) != JSON.stringify(nativvalue.native[key])) {
                                ischange = true;
                                objs.native[key] = nativvalue.native[key];
                                break;
                            }
                        }
                    } else {
                        ischange = true;
                    }
                }
                if (ischange) {
                    this.adapter.log.debug(`INFORMATION - Change common: ${this.adapter.namespace}.${ident}`);
                    delete objs.common;
                    objs.common = common;
                    objs.type = types;
                    await this.adapter.setObject(ident, objs);
                }
            }
        } catch (error: any) {
            this.adapter.log.warn(`createDataPoint e: ${error.name}: ${error.message}`);
        }
    }

    /**
     * Update after state change
     */
    public async updateStateHTML(): Promise<void> {
        if (!this.adapter.config.usehtml) {
            this.adapter.log.debug(`Catch HTLM update.`);
            return Promise.resolve();
        }
        if (this.works) {
            return;
        }
        this.works = true;
        try {
            await this.sleep(60 * 1000);
            await this.updateHTML();
            this.works = false;
        } catch {
            this.works = false;
        }
        this.adapter.log.debug(`Finished updateStateHTML.`);
        return Promise.resolve();
    }

    /**
     * destroy all
     */
    public destroy(): Promise<boolean> {
        this.delayTimeout && this.adapter.clearTimeout(this.delayTimeout);
        this.delayTimeout = undefined;
        return Promise.resolve(true);
    }

    /**
     * @param ms milliseconds
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => {
            this.delayTimeout = this.adapter.setTimeout(resolve, ms);
        });
    }
}
