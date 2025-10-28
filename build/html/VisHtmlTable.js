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
var VisHtmlTable_exports = {};
__export(VisHtmlTable_exports, {
  VisHtmlTable: () => VisHtmlTable
});
module.exports = __toCommonJS(VisHtmlTable_exports);
class VisHtmlTable {
  adapter;
  delayTimeout;
  htmlVal;
  stateVal;
  lang;
  works;
  /**
   * @param adapter ioBroker
   */
  constructor(adapter) {
    this.adapter = adapter;
    this.htmlVal = {};
    this.stateVal = {};
    this.delayTimeout = void 0;
    this.lang = "de";
    this.works = false;
  }
  /**
   * @param id ID
   * @param val Value state
   */
  async changeEnabled(id, val) {
    if (!this.adapter.config.usehtml) {
      return;
    }
    this.adapter.log.debug(`changeEnabled: ${id} - ${JSON.stringify(val)}`);
    const value = typeof val === "boolean" ? val : val == null ? void 0 : val.val;
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
  async changeHTML(id, val) {
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
  async updateHTML() {
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
  async changeTrigger(id, val, first = true) {
    if (!this.adapter.config.usehtml) {
      return;
    }
    this.adapter.log.debug(`changeTrigger: ${id} - ${JSON.stringify(val)} - ${first}`);
    const values = typeof val === "string" ? val : val == null ? void 0 : val.val;
    if (id != void 0 && values != null) {
      const enabled = await this.adapter.getStateAsync(id.replace(".data", ".enabled"));
      const value = typeof values === "string" ? JSON.parse(values) : values;
      value.enabled = enabled != null && enabled.val != null ? enabled.val : false;
      this.stateVal[id] = value;
      if (first) {
        await this.createHTML();
      }
    }
  }
  async createHTML() {
    this.adapter.log.debug(`Start update HTML!`);
    if (typeof this.stateVal === "object" && Object.keys(this.stateVal).length === 0) {
      return;
    }
    const id = this.htmlVal;
    let text = "";
    let count = 0;
    let countall = 0;
    const now = /* @__PURE__ */ new Date();
    const today_style = {
      0: "",
      1: "",
      2: "",
      3: "",
      4: "",
      5: "",
      6: "",
      7: ""
    };
    today_style[(/* @__PURE__ */ new Date()).getDay()] = " font-weight:bold;";
    for (const state in this.stateVal) {
      const data = this.stateVal[state];
      let devices = "";
      let status = "";
      const next_event = ["", "", "", "", "", "", ""];
      let triggers = "";
      let iTag = "";
      let iTagEnd = "";
      let font_text_color = id.font_color_text_enabled;
      if (!data.enabled) {
        iTag = `<i>`;
        iTagEnd = `</i>`;
        font_text_color = id.font_color_text_disabled;
      }
      let counter = 0;
      let nextDateTime = 0;
      let nextDateTimeIcon = 0;
      let nextaction = "";
      const nextName = [];
      for (const trigger of data.triggers) {
        ++countall;
        nextDateTimeIcon = nextDateTime;
        let change_times = "";
        let times = "";
        let action = "";
        ++counter;
        const nextNameData = {
          getDate: 0,
          date: /* @__PURE__ */ new Date(),
          action: ""
        };
        const isodd = counter % 2 != 0 ? id.background_color_even : id.background_color_odd;
        let addDate = 0;
        if (trigger.type === "TimeTrigger") {
          if (trigger.hour === 0 && trigger.minute === 0) {
            addDate = 1;
          }
          const switchTime = /* @__PURE__ */ new Date(
            `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() + addDate} ${trigger.hour}:${trigger.minute}`
          );
          if (switchTime >= now && trigger.weekdays.includes(now.getDay())) {
            nextDateTime = await this.nextEvent(now.getDay(), nextDateTime);
          } else {
            const t = await this.nextDateSwitch(/* @__PURE__ */ new Date(), trigger);
            nextDateTime = await this.nextEvent(new Date(t).getDay(), nextDateTime);
          }
          nextNameData.getDate = nextDateTime;
          nextNameData.date = switchTime;
          times = `${trigger.hour.toString().padStart(2, "0")}:${trigger.minute.toString().padStart(2, "0")}`;
          change_times = `<input type="time" id="nexttime${countall}" value="${times}" required /> <input for="nexttime" type="button" value="save" onclick="sendToTime('${this.adapter.namespace}', 'time', '${trigger.id}', '${state}', '${countall}')" /> `;
        } else if (trigger.type === "AstroTrigger") {
          if (new Date(trigger.todayTrigger.date) >= now) {
            nextDateTime = new Date(trigger.todayTrigger.date).getDay();
          } else {
            nextDateTime = await this.nextEvent(new Date(trigger.todayTrigger.date).getDay(), nextDateTime);
          }
          nextNameData.getDate = nextDateTime;
          nextNameData.date = new Date(trigger.todayTrigger.date);
          times = `${trigger.todayTrigger.hour.toString().padStart(2, "0")}:${trigger.todayTrigger.minute.toString().padStart(2, "0")}`;
          change_times = `<select id="timeselect${countall}">
                    <option value="sunrise" ${trigger.astroTime === "sunrise" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("sunrise")}</option>
                    <option value="solarNoon" ${trigger.astroTime === "solarNoon" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("solarNoon")}</option>
                    <option value="sunset" ${trigger.astroTime === "sunset" ? 'selected="selected"' : ""}>
                    ${await this.helper_translator("sunset")}</option>
                    </select>
                    <input size="2px" type="number" id="shift${countall}" min="-120" max="120" step="1" placeholder="00" required value="${trigger.shiftInMinutes}" />
                    <input for="timeselect${countall}" type="button" value="save" onclick="sendToAstro('${this.adapter.namespace}', 'astro', '${state}', '${trigger.id}', '${countall}')" />`;
        } else if (trigger.type === "OneTimeTrigger") {
          nextDateTime = await this.nextEvent(new Date(trigger.date).getDay(), nextDateTime);
          if (await this.getWeek(new Date(trigger.date)) === await this.getWeek(/* @__PURE__ */ new Date())) {
            trigger.weekdays = [(/* @__PURE__ */ new Date()).getDay()];
          }
          nextNameData.getDate = nextDateTime;
          nextNameData.date = new Date(trigger.date);
          times = `${new Date(trigger.date).getHours().toString().padStart(2, "0")}:${new Date(trigger.date).getMinutes().toString().padStart(2, "0")}`;
          change_times = `<input class="datetime" type="datetime-local" name="datetime" id="datetime${countall}" value="${this.adapter.formatDate(new Date(trigger.date), "YYYY-MM-DD hh:mm")}"min="${this.adapter.formatDate(/* @__PURE__ */ new Date(), "YYYY-MM-DD hh:mm")}"max="${this.adapter.formatDate(new Date((/* @__PURE__ */ new Date()).setFullYear((/* @__PURE__ */ new Date()).getFullYear() + 1)), "YYYY-MM-DD hh:mm")}"required /><input for="datetime${countall}" type="button" value="save" onclick="sendToDateTime('${this.adapter.namespace}', 'datetime', '${trigger.id}', '${state}', '${countall}')" /> `;
        }
        if (trigger.action && trigger.action.type === "ConditionAction") {
          const iconCon = trigger.action.action.name === "On" ? id.icon_true : id.icon_false;
          action = `&ensp;${iTag}${trigger.action.condition.constant}${trigger.action.condition.sign}${trigger.action.condition.constant}${iTagEnd}&ensp;${iconCon}`;
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
        triggers += `
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
                <td id="weekday" onClick="changeweekdays('${this.adapter.namespace}', 'week', '${state}', '${trigger.id}', 1, '${trigger.type}')" style="cursor: pointer; text-align:${id.column_align_row_04}; ${today_style[1]} color:${trigger.weekdays && trigger.weekdays.includes(1) ? id.font_color_weekdays_enabled : id.font_color_weekdays_disabled};">${iTag}${id.column_text_04}${iTagEnd}</td>
                <td id="weekday" onClick="changeweekdays('${this.adapter.namespace}', 'week', '${state}', '${trigger.id}', 2, '${trigger.type}')" style="cursor: pointer; text-align:${id.column_align_row_05}; ${today_style[2]} color:${trigger.weekdays && trigger.weekdays.includes(2) ? id.font_color_weekdays_enabled : id.font_color_weekdays_disabled};">${iTag}${id.column_text_05}${iTagEnd}</td>
                <td id="weekday" onClick="changeweekdays('${this.adapter.namespace}', 'week', '${state}', '${trigger.id}', 3, '${trigger.type}')" style="cursor: pointer; text-align:${id.column_align_row_06}; ${today_style[3]} color:${trigger.weekdays && trigger.weekdays.includes(3) ? id.font_color_weekdays_enabled : id.font_color_weekdays_disabled};">${iTag}${id.column_text_06}${iTagEnd}</td>
                <td id="weekday" onClick="changeweekdays('${this.adapter.namespace}', 'week', '${state}', '${trigger.id}', 4, '${trigger.type}')" style="cursor: pointer; text-align:${id.column_align_row_07}; ${today_style[4]} color:${trigger.weekdays && trigger.weekdays.includes(4) ? id.font_color_weekdays_enabled : id.font_color_weekdays_disabled};">${iTag}${id.column_text_07}${iTagEnd}</td>
                <td id="weekday" onClick="changeweekdays('${this.adapter.namespace}', 'week', '${state}', '${trigger.id}', 5, '${trigger.type}')" style="cursor: pointer; text-align:${id.column_align_row_08}; ${today_style[5]} color:${trigger.weekdays && trigger.weekdays.includes(5) ? id.font_color_weekdays_enabled : id.font_color_weekdays_disabled};">${iTag}${id.column_text_08}${iTagEnd}</td>
                <td id="weekday" onClick="changeweekdays('${this.adapter.namespace}', 'week', '${state}', '${trigger.id}', 6, '${trigger.type}')" style="cursor: pointer; text-align:${id.column_align_row_09}; ${today_style[6]} color:${trigger.weekdays && trigger.weekdays.includes(6) ? id.font_color_weekdays_enabled : id.font_color_weekdays_disabled};">${iTag}${id.column_text_09}${iTagEnd}</td>
                <td id="weekday" onClick="changeweekdays('${this.adapter.namespace}', 'week', '${state}', '${trigger.id}', 0, '${trigger.type}')" style="cursor: pointer; text-align:${id.column_align_row_10}; ${today_style[0]} color:${trigger.weekdays && trigger.weekdays.includes(0) ? id.font_color_weekdays_enabled : id.font_color_weekdays_disabled};">${iTag}${id.column_text_10}${iTagEnd}</td>
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
      status = `${data.onAction.onValue}/${data.onAction.offValue}&ensp;${data.enabled ? id.icon_true : id.icon_false}`;
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
  nextAction(nextDateTime, nextName, nextaction) {
    const action = nextName.filter((t) => t.getDate === nextDateTime);
    if (action && action.length > 0) {
      const next = action.sort((a, b) => a.date - b.date);
      return next[0].action;
    }
    return Promise.resolve(nextaction);
  }
  getWeek(times) {
    const onejan = new Date(times.getFullYear(), 0, 1);
    const today = new Date(times.getFullYear(), times.getMonth(), times.getDate());
    const dayOfYear = (today - onejan + 864e5) / 864e5;
    return Promise.resolve(Math.ceil(dayOfYear / 7));
  }
  nextEvent(actual, next) {
    if (actual === 0) {
      actual = 7;
    }
    if (actual > next) {
      return Promise.resolve(actual);
    }
    return Promise.resolve(next);
  }
  async nextDateSwitch(now, trigger) {
    let diffDays = 0;
    const nextDay = trigger.weekdays.length === 1 ? trigger.weekdays[0] : await this.nextActiveDay(trigger.weekdays, now.getDay());
    if (nextDay > now.getDay()) {
      diffDays = nextDay - now.getDay();
    } else {
      diffDays = nextDay + 7 - now.getDay();
    }
    const next = new Date(now.setDate(now.getDate() + diffDays));
    const hour = trigger.hour != null ? trigger.hour : trigger.todayTrigger.hour;
    const minute = trigger.minute != null ? trigger.minute : trigger.todayTrigger.minute;
    return (/* @__PURE__ */ new Date(
      `${next.getFullYear()}-${next.getMonth() + 1}-${next.getDate()} ${hour}:${minute}`
    )).toISOString();
  }
  nextActiveDay(array, day) {
    array = array.map((val) => {
      return val === 0 ? 7 : val;
    });
    const numChecker = (num) => array.find((v) => v > num);
    const next = numChecker(day);
    return Promise.resolve(next == void 0 ? 0 : next);
  }
  async mergeHTML(htmltext, countall, count) {
    this.adapter.log.debug(`Save HTML code.`);
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
            padding-top: 10px; padding-bottom: 10px; text-align: ${id.p_tag_text_algin}
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
        ${this.adapter.formatDate(/* @__PURE__ */ new Date(), "TT.MM.JJJJ hh:mm:ss")}</p></th>
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
      ack: true
    });
  }
  helper_translator(word) {
    const all = {
      top_last_update: {
        en: "Last update:",
        de: "Letzte Aktualisierung:",
        ru: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435:",
        pt: "\xDAltima atualiza\xE7\xE3o:",
        nl: "Laatste update:",
        fr: "Derni\xE8re mise \xE0 jour :",
        it: "Ultimo aggiornamento:",
        es: "\xDAltima actualizaci\xF3n:",
        pl: "Ostatnia aktualizacja",
        uk: "\u041E\u0441\u0442\u0430\u043D\u043D\u0454 \u043E\u043D\u043E\u0432\u043B\u0435\u043D\u043D\u044F:",
        "zh-cn": "\u4E0A\u6B21\u66F4\u65B0:"
      },
      footer: {
        en: "Total trigger",
        de: "Gesamtausl\xF6sung",
        ru: "\u041E\u0431\u0449\u0438\u0439 \u0442\u0440\u0438\u0433\u0433\u0435\u0440",
        pt: "Total de gatilho",
        nl: "Totaal trigger",
        fr: "D\xE9clencheur total",
        it: "Attacco totale",
        es: "Total disparador",
        pl: "Wy\u0142\u0105cznik ca\u0142kowity",
        uk: "\u0417\u0430\u0433\u0430\u043B\u044C\u043D\u0438\u0439 \u0442\u0440\u0438\u0433\u0435\u0440",
        "zh-cn": "\u603B\u89E6\u53D1\u6570"
      },
      footerobject: {
        en: "Total objects",
        de: "Objekte insgesamt",
        ru: "\u0412\u0441\u0435\u0433\u043E \u043E\u0431\u044A\u0435\u043A\u0442\u043E\u0432",
        pt: "Objetos totais",
        nl: "Totaal objecten",
        fr: "Total des objets",
        it: "Oggetti totali",
        es: "Total de objetos",
        pl: "Ca\u0142kowita liczba obiekt\xF3w",
        uk: "\u0412\u0441\u044C\u043E\u0433\u043E \u043E\u0431'\u0454\u043A\u0442\u0456\u0432",
        "zh-cn": "\u76EE\u6807\u5171\u8BA1"
      },
      sunrise: {
        en: "Sunrise",
        de: "Sonnenaufgang",
        ru: "\u0412\u043E\u0441\u0445\u043E\u0434",
        pt: "Nascer do sol",
        nl: "zonsopkomst",
        fr: "lever du soleil",
        it: "Alba",
        es: "amanecer",
        pl: "wsch\xF3d s\u0142o\u0144ca",
        uk: "\u0421\u0445\u0456\u0434 \u0441\u043E\u043D\u0446\u044F",
        "zh-cn": "\u65E5\u51FA"
      },
      sunset: {
        en: "Sunset",
        de: "Sonnenuntergang",
        ru: "\u0417\u0430\u043A\u0430\u0442 \u0441\u043E\u043B\u043D\u0446\u0430",
        pt: "P\xF4r do sol",
        nl: "Zonsondergang",
        fr: "Le coucher du soleil",
        it: "Tramonto",
        es: "Puesta de sol",
        pl: "Zach\xF3d s\u0142o\u0144ca",
        uk: "\u0417\u0430\u0445\u0456\u0434 \u0441\u043E\u043D\u0446\u044F",
        "zh-cn": "\u65E5\u843D"
      },
      solarNoon: {
        en: "Noon",
        de: "Mittag",
        ru: "\u041F\u043E\u043B\u0434\u0435\u043D\u044C",
        pt: "Meio-dia",
        nl: "Middag",
        fr: "Le midi",
        it: "Mezzogiorno",
        es: "Mediod\xEDa",
        pl: "Po\u0142udnie",
        uk: "\u043F\u043E\u043B\u0443\u0434\u0435\u043D\u044C",
        "zh-cn": "\u4E2D\u5348"
      }
    };
    return all[word][this.lang];
  }
  /**
   * @param lang Lang
   */
  async createStates(lang) {
    this.lang = lang;
    this.adapter.log.info(`Create HTML states!`);
    let common = {};
    let val;
    common = {
      name: "HTML",
      desc: "HTML"
    };
    await this.createDataPoint("html", common, "folder");
    common = {
      type: "string",
      role: "level.color.rgb",
      name: {
        en: "Heading underlined color",
        de: "Heading unterstrichene Farbe",
        ru: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u043F\u043E\u0434\u0447\u0435\u0440\u043A\u043D\u0443\u0442\u044B\u0439 \u0446\u0432\u0435\u0442",
        pt: "Cor sublinhada de cabe\xE7a",
        nl: "Vertaling:",
        fr: "T\xEAte de couleur soulign\xE9e",
        it: "Intestazione colore sottolineato",
        es: "Cabeza de color subrayado",
        pl: "G\u0142owa podkre\u015Blona koloru",
        uk: "\u041F\u043E\u0434\u0430\u0454\u0442\u044C\u0441\u044F \u0437\u0433\u0456\u0434\u043D\u043E \u0437 \u043A\u043E\u043B\u044C\u043E\u0440\u043E\u043C",
        "zh-cn": "\u6807\u9898\u7A81\u51FA\u5F3A\u8C03\u989C\u8272"
      },
      desc: "Heading underlined color",
      read: true,
      write: true,
      def: "#ffffff"
    };
    await this.createDataPoint("html.headline_underlined_color", common, "state");
    val = await this.adapter.getStateAsync("html.headline_underlined_color");
    this.htmlVal.headline_underlined_color = val == null ? void 0 : val.val;
    common = {
      type: "number",
      role: "value",
      name: {
        en: "Heading underlined",
        de: "Unterstrichen",
        ru: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u043F\u043E\u0434\u0447\u0435\u0440\u043A\u043D\u0443\u0442",
        pt: "Rubrica sublinhada",
        nl: "Ondersteuning",
        fr: "Heading underlined",
        it: "Denominazione sottolineata",
        es: "Encabezamiento subrayado",
        pl: "Headlong underlined",
        uk: "\u041F\u043E\u0434\u0430\u0454\u0442\u044C\u0441\u044F \u0437\u0433\u0456\u0434\u043D\u043E \u0437",
        "zh-cn": "\u6807\u9898\u5F3A\u8C03"
      },
      desc: "Heading underlined",
      read: true,
      write: true,
      def: 3,
      unit: "px"
    };
    await this.createDataPoint("html.headline_underlined", common, "state");
    val = await this.adapter.getStateAsync("html.headline_underlined");
    this.htmlVal.headline_underlined = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "Headline font weight",
        de: "Headline Schriftst\xE4rke",
        ru: "\u0412\u0435\u0441 \u0448\u0440\u0438\u0444\u0442\u0430 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0430",
        pt: "Peso da fonte do t\xEDtulo",
        nl: "Hoofdlettertypegewicht",
        fr: "Poids de la police en t\xEAte",
        it: "Headline font peso",
        es: "Headline font weight",
        pl: "Masa czcionki nag\u0142\xF3wka",
        uk: "\u0412\u0430\u0433\u0430 \u0448\u0440\u0438\u0444\u0442\u0443",
        "zh-cn": "\u5934\u6761\u5B57\u4F53\u91CD\u91CF"
      },
      desc: "Headline font weight",
      read: true,
      write: true,
      def: "normal",
      states: {
        normal: "normal",
        bold: "bold"
      }
    };
    await this.createDataPoint("html.headline_weight", common, "state");
    val = await this.adapter.getStateAsync("html.headline_weight");
    this.htmlVal.headline_weight = val == null ? void 0 : val.val;
    common = {
      type: "number",
      role: "value",
      name: {
        en: "Headline font size",
        de: "Headline Schriftgr\xF6\xDFe",
        ru: "\u0420\u0430\u0437\u043C\u0435\u0440 \u0448\u0440\u0438\u0444\u0442\u0430 Headline",
        pt: "Tamanho da fonte do t\xEDtulo",
        nl: "Hoofdlijn lettertype",
        fr: "Headline font size",
        it: "Formato del carattere",
        es: "Tama\xF1o de la fuente",
        pl: "Fontanny",
        uk: "\u0420\u043E\u0437\u043C\u0456\u0440 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0433\u043E \u0448\u0440\u0438\u0444\u0442\u0443",
        "zh-cn": "\u5BFC \u8A00"
      },
      desc: "Headline height",
      read: true,
      write: true,
      def: 16,
      unit: "px"
    };
    await this.createDataPoint("html.headline_font_size", common, "state");
    val = await this.adapter.getStateAsync("html.headline_font_size");
    this.htmlVal.headline_font_size = val == null ? void 0 : val.val;
    common = {
      type: "number",
      role: "value",
      name: {
        en: "Headline height",
        de: "Kopfh\xF6he",
        ru: "\u0412\u044B\u0441\u043E\u0442\u0430 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0430",
        pt: "Altura do t\xEDtulo",
        nl: "Hoofdlijn lengte",
        fr: "Hauteur de la t\xEAte",
        it: "Altezza della testa",
        es: "Altura del t\xEDtulo",
        pl: "Headline height",
        uk: "\u0412\u0438\u0441\u043E\u0442\u0430 \u043B\u0456\u043D\u0456\u0457",
        "zh-cn": "\u6807\u9898\u9AD8"
      },
      desc: "Headline height",
      read: true,
      write: true,
      def: 35,
      unit: "px"
    };
    await this.createDataPoint("html.headline_height", common, "state");
    val = await this.adapter.getStateAsync("html.headline_height");
    this.htmlVal.headline_height = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "level.color.rgb",
      name: {
        en: "Headline color",
        de: "Kopffarbe",
        ru: "\u0426\u0432\u0435\u0442 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0430",
        pt: "Cor do t\xEDtulo",
        nl: "Hoofdlijn kleur",
        fr: "Couleur Headline",
        it: "Colore della testa",
        es: "Color de encabezado",
        pl: "Kolor",
        uk: "\u041A\u043E\u043B\u0456\u0440 \u043B\u0456\u043D\u0456\u0457",
        "zh-cn": "\u6807\u9898"
      },
      desc: "Headline color",
      read: true,
      write: true,
      def: "#ffffff"
    };
    await this.createDataPoint("html.headline_color", common, "state");
    val = await this.adapter.getStateAsync("html.headline_color");
    this.htmlVal.headline_color = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "TOP text",
        de: "TOP-Text",
        ru: "\u0422\u041E\u041F-\u0442\u0435\u043A\u0441\u0442",
        pt: "Texto do TOP",
        nl: "Top",
        fr: "Texte TOP",
        it: "Testo TOP",
        es: "Texto de la p\xE1gina",
        pl: "Tekst TOP",
        uk: "\u0413\u043E\u043B\u043E\u0432\u043D\u0430",
        "zh-cn": "\u6848\u6587"
      },
      desc: "TOP text",
      read: true,
      write: true,
      def: "your text"
    };
    await this.createDataPoint("html.top_text", common, "state");
    val = await this.adapter.getStateAsync("html.top_text");
    this.htmlVal.top_text = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "TOP font weight",
        de: "TOP Schriftst\xE4rke",
        ru: "TOP \u0432\u0435\u0441 \u0448\u0440\u0438\u0444\u0442\u0430",
        pt: "Peso da fonte TOP",
        nl: "ToP font gewicht",
        fr: "Poids de police TOP",
        it: "TOP font peso",
        es: "TOP font weight",
        pl: "TOP",
        uk: "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430 \u0432\u0430\u0433\u0430 \u0448\u0440\u0438\u0444\u0442\u0443",
        "zh-cn": "\u6392 \u6743"
      },
      desc: "TOP font weight",
      read: true,
      write: true,
      def: "normal",
      states: {
        normal: "normal",
        bold: "bold"
      }
    };
    await this.createDataPoint("html.top_font_weight", common, "state");
    val = await this.adapter.getStateAsync("html.top_font_weight");
    this.htmlVal.top_font_weight = val == null ? void 0 : val.val;
    common = {
      type: "number",
      role: "value",
      name: {
        en: "TOP font size",
        de: "TOP Schriftgr\xF6\xDFe",
        ru: "TOP \u0440\u0430\u0437\u043C\u0435\u0440 \u0448\u0440\u0438\u0444\u0442\u0430",
        pt: "Tamanho da fonte TOP",
        nl: "ToP font maat",
        fr: "Taille de police TOP",
        it: "Dimensione del carattere TOP",
        es: "Tama\xF1o de fuente TOP",
        pl: "TOP",
        uk: "\u0420\u043E\u0437\u043C\u0456\u0440 \u0448\u0440\u0438\u0444\u0442\u0443",
        "zh-cn": "\u6392 \u5EA6"
      },
      desc: "TOP font size",
      read: true,
      write: true,
      def: 20,
      unit: "px"
    };
    await this.createDataPoint("html.top_font_size", common, "state");
    val = await this.adapter.getStateAsync("html.top_font_size");
    this.htmlVal.top_font_size = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "TOP font",
        de: "TOP Schriftart",
        ru: "TOP \u0448\u0440\u0438\u0444\u0442",
        pt: "Fonte TOP",
        nl: "Top font",
        fr: "Police TOP",
        it: "TOP font",
        es: "Fuente TOP",
        pl: "TOP",
        uk: "\u0422\u043E\u043F \u0448\u0440\u0438\u0444\u0442",
        "zh-cn": "\u4E09\u3001\u7ED3 \u8BBA"
      },
      desc: "TOP font",
      read: true,
      write: true,
      def: "Helvetica"
    };
    await this.createDataPoint("html.top_font_family", common, "state");
    val = await this.adapter.getStateAsync("html.top_font_family");
    this.htmlVal.top_font_family = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "level.color.rgb",
      name: {
        en: "TOP text color",
        de: "TOP Textfarbe",
        ru: "\u0422\u041E\u041F \u0446\u0432\u0435\u0442 \u0442\u0435\u043A\u0441\u0442\u0430",
        pt: "Cor de texto TOP",
        nl: "Top sms kleur",
        fr: "Couleur du texte TOP",
        it: "Colore del testo TOP",
        es: "Color de texto",
        pl: "Ok\u0142adka",
        uk: "\u041A\u043E\u043B\u0456\u0440 \u0442\u0435\u043A\u0441\u0442\u0443",
        "zh-cn": "\u6848\u6587"
      },
      desc: "TOP text color",
      read: true,
      write: true,
      def: "#ffffff"
    };
    await this.createDataPoint("html.top_text_color", common, "state");
    val = await this.adapter.getStateAsync("html.top_text_color");
    this.htmlVal.top_text_color = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "level.color.rgb",
      name: {
        en: "TAG <table> header linear color 2.",
        de: "TAG <table> Header lineare Farbe 2.",
        ru: "TAG <table> \u043B\u0438\u043D\u0435\u0439\u043D\u044B\u0439 \u0446\u0432\u0435\u0442 2.",
        pt: "Cor linear de cabe\xE7alho TAG <table> 2.",
        nl: "Tag <table> hoofd lineaire kleur 2.",
        fr: "Couleur lin\xE9aire TAG <table> en-t\xEAte 2.",
        it: "TAG <table> intestazione colore lineare 2.",
        es: "TAG <table> Header linear color 2.",
        pl: "TAG <table> koloru liniowego 2.",
        uk: "TAG <table> \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u043B\u0456\u043D\u0456\u0439\u043D\u043E\u0433\u043E \u043A\u043E\u043B\u044C\u043E\u0440\u0443 2.",
        "zh-cn": "TAG <table>\u5934\u5BF8ar\u989C\u82722."
      },
      desc: "TAG <table> header linear color 2.",
      read: true,
      write: true,
      def: "#BDBDBD"
    };
    await this.createDataPoint("html.header_linear_color_2", common, "state");
    val = await this.adapter.getStateAsync("html.header_linear_color_2");
    this.htmlVal.header_linear_color_2 = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "level.color.rgb",
      name: {
        en: "TAG <table> header linear color 1.",
        de: "TAG <table> Header lineare Farbe 1.",
        ru: "TAG <table> \u043B\u0438\u043D\u0435\u0439\u043D\u044B\u0439 \u0446\u0432\u0435\u0442 1.",
        pt: "Cor linear de cabe\xE7alho TAG <table> 1.",
        nl: "Tag <table> hoofd lineaire kleur 1.",
        fr: "Couleur lin\xE9aire TAG <table> en-t\xEAte 1.",
        it: "TAG <table> intestazione colore lineare 1.",
        es: "TAG <table> Header linear color 1.",
        pl: "TAG <table> koloru liniowego 1.",
        uk: "TAG <table> \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u043B\u0456\u043D\u0456\u0439\u043D\u043E\u0433\u043E \u043A\u043E\u043B\u044C\u043E\u0440\u0443 1.",
        "zh-cn": "TAG <table>\u5934\u5BF8ar\u989C\u82721."
      },
      desc: "TAG <table> header linear color 1.",
      read: true,
      write: true,
      def: "#BDBDBD"
    };
    await this.createDataPoint("html.header_linear_color_1", common, "state");
    val = await this.adapter.getStateAsync("html.header_linear_color_1");
    this.htmlVal.header_linear_color_1 = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "TAG <table> header font family.",
        de: "TAG <table> Header Schriftfamilie.",
        ru: "TAG <table> \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u0441\u0435\u043C\u0435\u0439\u0441\u0442\u0432\u0430 \u0448\u0440\u0438\u0444\u0442\u043E\u0432.",
        pt: "TAG <table> header font family.",
        nl: "TAG-lettertypefamilie <table>.",
        fr: "Famille de polices d'en-t\xEAte TAG <table>.",
        it: "TAG <table> intestazione famiglia font.",
        es: "TAG <table> header font family.",
        pl: "Rodzina czcionek TAG <table>.",
        uk: "TAG <table> \u0433\u043E\u043B\u043E\u0432\u043A\u0438 \u0441\u0456\u043C\u0435\u0439\u0441\u0442\u0432\u0430 \u0448\u0440\u0438\u0444\u0442\u0456\u0432.",
        "zh-cn": "TAG<table>\u5934\u5B57\u4F53\u5BB6\u65CF."
      },
      desc: "TAG <table> header font family.",
      read: true,
      write: true,
      def: "Helvetica"
    };
    await this.createDataPoint("html.header_font_family", common, "state");
    val = await this.adapter.getStateAsync("html.header_font_family");
    this.htmlVal.header_font_family = val == null ? void 0 : val.val;
    common = {
      type: "number",
      role: "value",
      name: {
        en: "TAG <table> header font size.",
        de: "TAG <table> Header Schriftgr\xF6\xDFe.",
        ru: "TAG <table> \u0440\u0430\u0437\u043C\u0435\u0440 \u0448\u0440\u0438\u0444\u0442\u0430.",
        pt: "TAG <table> tamanho da fonte do cabe\xE7alho.",
        nl: "Tag <table> koper lettertype.",
        fr: "TAG <table> header font size.",
        it: "TAG <table> intestazione formato carattere.",
        es: "TAG <table> header font size.",
        pl: "TAG <table> \u2013 typ czcionki.",
        uk: "TAG <table> \u0440\u043E\u0437\u043C\u0456\u0440 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0430.",
        "zh-cn": "TAG <table>\u540D\u5BFC\u5E08\u89C4\u6A21\u3002."
      },
      desc: "TAG <table> header font size.",
      read: true,
      write: true,
      def: 15,
      unit: "px"
    };
    await this.createDataPoint("html.header_font_size", common, "state");
    val = await this.adapter.getStateAsync("html.header_font_size");
    this.htmlVal.header_font_size = val == null ? void 0 : val.val;
    common = {
      type: "number",
      role: "value",
      name: {
        en: "TAG <table> header border.",
        de: "TAG <table> Kopfgrenze.",
        ru: "TAG <table> \u0433\u0440\u0430\u043D\u0438\u0446\u044B \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0430.",
        pt: "TAG <table> fronteira de cabe\xE7alho.",
        nl: "TAG <table> hoofdgrens.",
        fr: "TAG <table> t\xEAte fronti\xE8re.",
        it: "TAG <table> bordo intestazione.",
        es: "TAG <table> frontera de cabecera.",
        pl: "TAG <table> \u2013 granica g\u0142odowa.",
        uk: "TAG <table> \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u043A\u043E\u0440\u0434\u043E\u043D\u0443.",
        "zh-cn": "TAG <table>\u5934\u5BF8\u8FB9\u754C\u3002."
      },
      desc: "TAG <table> header border.",
      read: true,
      write: true,
      def: 2,
      unit: "px"
    };
    await this.createDataPoint("html.header_border", common, "state");
    val = await this.adapter.getStateAsync("html.header_border");
    this.htmlVal.header_border = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "level.color.rgb",
      name: {
        en: "TAG <table> header border color.",
        de: "TAG <table> Header Randfarbe.",
        ru: "TAG <table> \u0446\u0432\u0435\u0442 \u0433\u0440\u0430\u043D\u0438\u0446\u044B \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0430.",
        pt: "TAG <table> cor da borda do cabe\xE7alho.",
        nl: "TAG <table> hoofd grenskleur.",
        fr: "TAG <table> couleur de la bordure d'en-t\xEAte.",
        it: "TAG <table> intestazione bordo colore.",
        es: "TAG <table> de color de borde de cabecera.",
        pl: "TAG <table> \u2013 kolor graniczny.",
        uk: "TAG <table> \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u043F\u0440\u0438\u043A\u043E\u0440\u0434\u043E\u043D\u043D\u043E\u0433\u043E \u043A\u043E\u043B\u044C\u043E\u0440\u0443.",
        "zh-cn": "TAG <table>\u5934\u90BB\u3002."
      },
      desc: "TAG <table> header border color.",
      read: true,
      write: true,
      def: "#424242"
    };
    await this.createDataPoint("html.header_tag_border_color", common, "state");
    val = await this.adapter.getStateAsync("html.header_tag_border_color");
    this.htmlVal.header_tag_border_color = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "TAG <table> header width (e.g. auto, 100% or 1080px).",
        de: "TAG <table> Kopfbreite (z.B. Auto, 100% oder 1080px.).",
        ru: "TAG <table> \u0448\u0438\u0440\u0438\u043D\u0430 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0430 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u0430\u0432\u0442\u043E, 100% \u0438\u043B\u0438 1080px.).",
        pt: "TAG <table> largura do cabe\xE7alho (por exemplo, auto, 100% ou 1080px.).",
        nl: "TAG <table> koper width (e.g auto, 100% of 1080px).",
        fr: "Largeur d'en-t\xEAte TAG <table> (p. ex. auto, 100% ou 1080px.).",
        it: "Larghezza intestazione TAG <table> (ad esempio auto, 100% o 1080px.).",
        es: "TAG <table> ancho de cabecera (por ejemplo auto, 100% o 1080px.).",
        pl: "TAG <table> (np. auto, 100% lub 1080 KM).",
        uk: "TAG <table> \u0448\u0438\u0440\u0438\u043D\u0430 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0430 (\u043D\u0430\u043F\u0440\u0438\u043A\u043B\u0430\u0434, \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u0438\u0439, 100% \u0430\u0431\u043E 1080px).",
        "zh-cn": "TAG <table> \u5934\u5DFE(\u5982\u6C7D\u8F66\u3001100%\u62161080px)."
      },
      desc: "TAG <table> header width (e.g. auto, 100% or 1080px).",
      read: true,
      write: true,
      def: "auto"
    };
    await this.createDataPoint("html.header_width", common, "state");
    val = await this.adapter.getStateAsync("html.header_width");
    this.htmlVal.header_width = val == null ? void 0 : val.val;
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
        pl: "TAG <table> wy\u015Bcie\u0142anie",
        uk: "TAG <table> \u043D\u0430\u043F\u043E\u0432\u043D\u044E\u0432\u0430\u0447",
        "zh-cn": "TAG <table> \u57AB\u88C5"
      },
      desc: "TAG <table> padding",
      read: true,
      write: true,
      def: 6,
      unit: "px"
    };
    await this.createDataPoint("html.table_tag_cell", common, "state");
    val = await this.adapter.getStateAsync("html.table_tag_cell");
    this.htmlVal.table_tag_cell = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "level.color.rgb",
      name: {
        en: "TAG <table> border color",
        de: "TAG <table> Grenzfarbe",
        ru: "TAG <table> \u043F\u043E\u0433\u0440\u0430\u043D\u0438\u0447\u043D\u044B\u0439 \u0446\u0432\u0435\u0442",
        pt: "TAG <table> cor da borda",
        nl: "TAG <tabel> randkleur",
        fr: "Couleur de la bordure de TAG <table>",
        it: "TAG <table> colore di confine",
        es: "TAG - color de borde ajustable",
        pl: "TAG < table > barwa graniczna",
        uk: "TAG <table> \u0431\u043E\u0440\u0434\u043E\u0432\u0438\u0439 \u043A\u043E\u043B\u0456\u0440",
        "zh-cn": "TAG < table > \u8FB9\u6846\u989C\u8272"
      },
      desc: "TAG <table> border color",
      read: true,
      write: true,
      def: "#424242"
    };
    await this.createDataPoint("html.table_tag_border_color", common, "state");
    val = await this.adapter.getStateAsync("html.table_tag_border_color");
    this.htmlVal.table_tag_border_color = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "TAG <table> text align",
        de: "TAG <table> Text ausrichten",
        ru: "TAG <table> \u0442\u0435\u043A\u0441\u0442",
        pt: "TAG <table> alinhamento de texto",
        nl: "TAG <table> sms-align",
        fr: "TAG <table> texte align\xE9",
        it: "TAG <table> testo allineare",
        es: "TAG <table> texto alineado",
        pl: "TAG <table> dopasowa\u0142",
        uk: "TAG <table> \u0442\u0435\u043A\u0441\u0442 \u0432\u0438\u0440\u0456\u0432\u043D\u044E\u0432\u0430\u043D\u043D\u044F",
        "zh-cn": "TAG<table>\u6848\u6587"
      },
      desc: "TAG <table> width",
      read: true,
      write: true,
      def: "center",
      states: ["center", "left", "right", "auto"]
    };
    await this.createDataPoint("html.table_tag_text_align", common, "state");
    val = await this.adapter.getStateAsync("html.table_tag_text_align");
    this.htmlVal.table_tag_text_align = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "TAG <table> width (e.g. auto or 100px)",
        de: "TAG <table> Breite (z.B. Auto oder 100px)",
        ru: "TAG <table> \u0448\u0438\u0440\u0438\u043D\u0430 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u0430\u0432\u0442\u043E \u0438\u043B\u0438 100px)",
        pt: "TAG <table> largura (por exemplo, auto ou 100px)",
        nl: "TAG <table> width (e.g auto of 100px)",
        fr: "TAG <table> largeur (p. ex. auto ou 100px)",
        it: "Larghezza TAG <table> (ad esempio auto o 100px)",
        es: "TAG <table> ancho (por ejemplo auto o 100px)",
        pl: "TAG <table> szeroko\u015B\u0107 (np. auto lub 100 KM)",
        uk: "TAG <table> \u0448\u0438\u0440\u0438\u043D\u0430 (\u043D\u0430\u043F\u0440\u0438\u043A\u043B\u0430\u0434, \u0430\u0432\u0442\u043E \u0430\u0431\u043E 100px)",
        "zh-cn": "TAG<table>\u59BB\u5B50(\u5982\u6C7D\u8F66\u6216100px)"
      },
      desc: "TAG <table> width (e.g. auto or 100px)",
      read: true,
      write: true,
      def: "auto"
    };
    await this.createDataPoint("html.table_tag_width", common, "state");
    val = await this.adapter.getStateAsync("html.table_tag_width");
    this.htmlVal.table_tag_width = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "TAG <table> width (e.g. auto or 100px)",
        de: "TAG <table> Breite (z.B. Auto oder 100px)",
        ru: "TAG <table> \u0448\u0438\u0440\u0438\u043D\u0430 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u0430\u0432\u0442\u043E \u0438\u043B\u0438 100px)",
        pt: "TAG <table> largura (por exemplo, auto ou 100px)",
        nl: "TAG <table> width (e.g auto of 100px)",
        fr: "TAG <table> largeur (p. ex. auto ou 100px)",
        it: "Larghezza TAG <table> (ad esempio auto o 100px)",
        es: "TAG <table> ancho (por ejemplo auto o 100px)",
        pl: "TAG <table> szeroko\u015B\u0107 (np. auto lub 100 KM)",
        uk: "TAG <table> \u0448\u0438\u0440\u0438\u043D\u0430 (\u043D\u0430\u043F\u0440\u0438\u043A\u043B\u0430\u0434, \u0430\u0432\u0442\u043E \u0430\u0431\u043E 100px)",
        "zh-cn": "TAG<table>\u59BB\u5B50(\u5982\u6C7D\u8F66\u6216100px)"
      },
      desc: "TAG <table> width (e.g. auto or 100px)",
      read: true,
      write: true,
      def: "auto"
    };
    await this.createDataPoint("html.table_tag_width", common, "state");
    val = await this.adapter.getStateAsync("html.table_tag_width");
    this.htmlVal.table_tag_width = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "level.color.rgb",
      name: {
        en: "TAG <td> border color",
        de: "TAG <td> Grenzfarbe",
        ru: "TAG <td> \u043F\u043E\u0433\u0440\u0430\u043D\u0438\u0447\u043D\u044B\u0439 \u0446\u0432\u0435\u0442",
        pt: "TAG <td> cor da borda",
        nl: "TAG <td> randkleur",
        fr: "Couleur de la bordure de TAG <td>",
        it: "TAG <td> colore di confine",
        es: "TAG <td> color de borde",
        pl: "TAG <td> kolor granic",
        uk: "TAG <td> \u0431\u043E\u0440\u0434\u043E\u0432\u0438\u0439 \u043A\u043E\u043B\u0456\u0440",
        "zh-cn": "TAG <td> \u8FB9\u6846\u989C\u8272"
      },
      desc: "TAG <td> border color",
      read: true,
      write: true,
      def: "#424242"
    };
    await this.createDataPoint("html.td_tag_border_color", common, "state");
    val = await this.adapter.getStateAsync("html.td_tag_border_color");
    this.htmlVal.td_tag_border_color = val == null ? void 0 : val.val;
    common = {
      type: "number",
      role: "value",
      name: {
        en: "TAG <td> border bottom",
        de: "TAG <td> Randboden",
        ru: "TAG <td> \u043F\u043E\u0433\u0440\u0430\u043D\u0438\u0447\u043D\u043E\u0435 \u0434\u043D\u043E",
        pt: "TAG <td> fronteira inferior",
        nl: "TAG <td> rand onder",
        fr: "TAG <td> fond de bordure",
        it: "TAG <td> fondo di confine",
        es: "TAG <td> inferior de la frontera",
        pl: "TAG <td> dolna granica",
        uk: "TAG <td> \u0431\u043E\u0440\u0434\u043E\u0432\u0438\u0439 \u0434\u043D\u043E",
        "zh-cn": "TAG <td> \u8FB9\u6846\u5E95\u90E8"
      },
      desc: "TAG <td> border bottom",
      read: true,
      write: true,
      def: 1,
      unit: "px"
    };
    await this.createDataPoint("html.td_tag_border_bottom", common, "state");
    val = await this.adapter.getStateAsync("html.td_tag_border_bottom");
    this.htmlVal.td_tag_border_bottom = val == null ? void 0 : val.val;
    common = {
      type: "number",
      role: "value",
      name: {
        en: "TAG <td> border right",
        de: "TAG <td> Grenze rechts",
        ru: "TAG <td> \u043F\u043E\u0433\u0440\u0430\u043D\u0438\u0447\u043D\u043E\u0435 \u043F\u0440\u0430\u0432\u043E",
        pt: "TAG <td> fronteira direita",
        nl: "TAG <td> randrechts",
        fr: "TAG <td> fronti\xE8re droite",
        it: "TAG <td> diritto di frontiera",
        es: "TAG <td> border right",
        pl: "TAG <td> prawo graniczne",
        uk: "TAG <td> \u043A\u043E\u0440\u0434\u043E\u043D \u043F\u0440\u044F\u043C\u043E",
        "zh-cn": "TAG <td> \u53F3\u8FB9\u8FB9\u6846"
      },
      desc: "TAG <td> border right",
      read: true,
      write: true,
      def: 1,
      unit: "px"
    };
    await this.createDataPoint("html.td_tag_border_right", common, "state");
    val = await this.adapter.getStateAsync("html.td_tag_border_right");
    this.htmlVal.td_tag_border_right = val == null ? void 0 : val.val;
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
        pl: "TAG < td > wy\u015Bcie\u0142anie",
        uk: "TAG <td> \u043D\u0430\u043F\u043E\u0432\u043D\u044E\u0432\u0430\u0447",
        "zh-cn": "TAG <td> \u57AB\u88C5"
      },
      desc: "TAG <td> padding",
      read: true,
      write: true,
      def: 6,
      unit: "px"
    };
    await this.createDataPoint("html.td_tag_cell", common, "state");
    val = await this.adapter.getStateAsync("html.td_tag_cell");
    this.htmlVal.td_tag_cell = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "Text align <p>",
        de: "Textausrichtung <p>",
        ru: "\u0422\u0435\u043A\u0441\u0442\u043E\u0432\u043E\u0435 \u0432\u044B\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u043D\u0438\u0435 <p>",
        pt: "Alinhamento de texto <p>",
        nl: "Tekstuitlijning <p>",
        fr: "Alignement du texte <p>",
        it: "Allineamento del testo <p>",
        es: "Texto alineado <p>",
        pl: "Tekst wyr\xF3wnania <p>",
        uk: "\u0422\u0435\u043A\u0441\u0442\u043E\u0432\u0435 \u0432\u0438\u0440\u0456\u0432\u043D\u044E\u0432\u0430\u043D\u043D\u044F <p>",
        "zh-cn": "\u6587\u672C\u5BF9\u9F50<p>"
      },
      desc: "Text align <p>",
      read: true,
      write: true,
      def: "center",
      states: ["center", "left", "right", "auto"]
    };
    await this.createDataPoint("html.p_tag_text_algin", common, "state");
    val = await this.adapter.getStateAsync("html.p_tag_text_algin");
    this.htmlVal.p_tag_text_algin = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "Font color enabled",
        de: "Schriftfarbe aktiviert",
        ru: "\u0412\u0441\u0442\u0440\u043E\u0435\u043D\u043D\u044B\u0439 \u0446\u0432\u0435\u0442",
        pt: "Cor da fonte habilitada",
        nl: "Lettertypekleur ingeschakeld",
        fr: "Couleur de la police activ\xE9e",
        it: "Colore del carattere abilitato",
        es: "Color de fuente habilitado",
        pl: "Kolor czcionki w\u0142\u0105czony",
        uk: "\u0423\u0432\u0456\u043C\u043A\u043D\u0443\u0442\u0438 \u043A\u043E\u043B\u0456\u0440 \u0448\u0440\u0438\u0444\u0442\u0443",
        "zh-cn": "\u5B57\u4F53\u5DF2\u542F\u7528"
      },
      desc: "Font color enabled",
      read: true,
      write: true,
      def: "yellow"
    };
    await this.createDataPoint("html.font_color_text_enabled", common, "state");
    val = await this.adapter.getStateAsync("html.font_color_text_enabled");
    this.htmlVal.font_color_text_enabled = val == null ? void 0 : val.val;
    common = {
      type: "boolean",
      role: "button",
      name: {
        en: "Update",
        de: "Aktualisierung",
        ru: "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435",
        pt: "Atualiza\xE7\xE3o",
        nl: "Bijwerken",
        fr: "Mise \xE0 jour",
        it: "Aggiornamento",
        es: "Actualizaci\xF3n",
        pl: "Aktualizacja",
        uk: "\u041D\u043E\u0432\u0438\u043D\u0438",
        "zh-cn": "\u66F4\u65B0"
      },
      desc: "Update",
      read: false,
      write: true,
      def: false
    };
    await this.createDataPoint("html.update", common, "state");
    common = {
      type: "string",
      role: "state",
      name: {
        en: "Font color disabled",
        de: "Schriftfarbe deaktiviert",
        ru: "\u0426\u0432\u0435\u0442 \u0444\u043E\u043D\u0430 \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D",
        pt: "Cor da fonte desativada",
        nl: "Lettertypekleur uitgeschakeld",
        fr: "Couleur de la police d\xE9sactiv\xE9e",
        it: "Colore del carattere disattivato",
        es: "Color de la fuente deshabilitado",
        pl: "Kolor czcionki wy\u0142\u0105czony",
        uk: "\u041A\u043E\u043B\u0456\u0440 \u0448\u0440\u0438\u0444\u0442\u0443 \u0432\u0438\u043C\u043A\u043D\u0435\u043D\u043E",
        "zh-cn": "\u5B57\u4F53\u5DF2\u7981\u7528"
      },
      desc: "Font color disabled",
      read: true,
      write: true,
      def: "red"
    };
    await this.createDataPoint("html.font_color_text_disabled", common, "state");
    val = await this.adapter.getStateAsync("html.font_color_text_disabled");
    this.htmlVal.font_color_text_disabled = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "Font color weekdays enabled",
        de: "Schriftfarbe Wochentage aktiviert",
        ru: "\u0426\u0432\u0435\u0442 \u043F\u0435\u043D\u0442\u0430 \u0432\u043A\u043B\u044E\u0447\u0435\u043D",
        pt: "Dia da semana colorida da fonte habilitado",
        nl: "Lettertypekleur weekdagen ingeschakeld",
        fr: "Couleur de la police en semaine activ\xE9e",
        it: "Colore del carattere giorni della settimana abilitati",
        es: "D\xEDas semanales de color de fuente habilitados",
        pl: "Kolor czcionki dni tygodnia w\u0142\u0105czone",
        uk: "\u0412\u0432\u0456\u043C\u043A\u043D\u0443\u0442\u0438 \u043A\u043E\u043B\u044C\u043E\u0440\u043E\u0432\u0456 \u0434\u0430\u0442\u0438",
        "zh-cn": "\u542F\u7528\u5B57\u4F53\u989C\u8272\u5DE5\u4F5C\u65E5"
      },
      desc: "Font color weekdays enabled",
      read: true,
      write: true,
      def: "yellow"
    };
    await this.createDataPoint("html.font_color_weekdays_enabled", common, "state");
    val = await this.adapter.getStateAsync("html.font_color_weekdays_enabled");
    this.htmlVal.font_color_weekdays_enabled = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "Font color weekdays disabled",
        de: "Schriftfarbe Wochentage deaktiviert",
        ru: "\u0426\u0432\u0435\u0442 \u043F\u0435\u043D\u0442\u0430 \u0431\u0443\u0434\u043D\u044F \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D",
        pt: "Dia da semana de cor da fonte desativado",
        nl: "Lettertypekleur weekdagen uitgeschakeld",
        fr: "Police couleur en semaine d\xE9sactiv\xE9e",
        it: "Colore del carattere giorni della settimana disabilitati",
        es: "Font color weekdays disabled",
        pl: "Kolor czcionki dni tygodnia wy\u0142\u0105czone",
        uk: "\u0424\u043E\u043D\u0442\u0430\u043D \u043A\u043E\u043B\u044C\u043E\u0440\u043E\u0432\u0438\u0439 \u0442\u0438\u0436\u0434\u0435\u043D\u044C \u0432\u0456\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043D\u044F",
        "zh-cn": "\u5B57\u4F53\u989C\u8272\u5DE5\u4F5C\u65E5\u5DF2\u7981\u7528"
      },
      desc: "Font color weekdays disabled",
      read: true,
      write: true,
      def: "red"
    };
    await this.createDataPoint("html.font_color_weekdays_disabled", common, "state");
    val = await this.adapter.getStateAsync("html.font_color_weekdays_disabled");
    this.htmlVal.font_color_weekdays_disabled = val == null ? void 0 : val.val;
    const states = [
      "\u{1F7E1}",
      "\u26AA",
      "\u{1F7E4}",
      "\u26AB",
      "\u{1F534}",
      "\u{1F535}",
      "\u{1F7E2}",
      "\u{1F7E0}",
      "\u{1F535}",
      "\u{1F7E3}",
      "\u2705",
      "\u274C",
      "\u2B55",
      "\u23F1",
      "\u{1F480}",
      "\u{1F44D}",
      "\u{1F44E}",
      "\u{1F4D1}",
      "\u{1F4B2}",
      "\u{1F440}"
    ];
    common = {
      type: "string",
      role: "state",
      name: {
        en: "State comparison activated",
        de: "Zustandsvergleich aktiviert",
        ru: "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0439 \u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D\u043E",
        pt: "Compara\xE7\xE3o de estados ativada",
        nl: "Statusvergelijking geactiveerd",
        fr: "Comparaison d'\xE9tat activ\xE9e",
        it: "Confronto di stato attivato",
        es: "Comparaci\xF3n de estados activada",
        pl: "Por\xF3wnanie stan\xF3w zosta\u0142o aktywowane",
        uk: "\u041F\u043E\u0440\u0456\u0432\u043D\u044F\u043D\u043D\u044F \u0441\u0442\u0430\u043D\u0456\u0432 \u0430\u043A\u0442\u0438\u0432\u043E\u0432\u0430\u043D\u043E",
        "zh-cn": "\u72B6\u6001\u6BD4\u8F83\u5DF2\u6FC0\u6D3B"
      },
      desc: "State comparison activated",
      read: true,
      write: true,
      def: "\u{1F7E2}",
      states
    };
    await this.createDataPoint("html.icon_state_check_yes", common, "state");
    val = await this.adapter.getStateAsync("html.icon_state_check_yes");
    this.htmlVal.icon_state_check_yes = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "State comparison disabled",
        de: "Statusvergleich deaktiviert",
        ru: "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0439 \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u043E",
        pt: "Compara\xE7\xE3o de estados desabilitada",
        nl: "Staatsvergelijking uitgeschakeld",
        fr: "Comparaison d'\xE9tat d\xE9sactiv\xE9e",
        it: "Confronto di stato disabilitato",
        es: "Comparaci\xF3n de estados deshabilitada",
        pl: "Por\xF3wnanie stan\xF3w wy\u0142\u0105czone",
        uk: "\u041F\u043E\u0440\u0456\u0432\u043D\u044F\u043D\u043D\u044F \u0441\u0442\u0430\u043D\u0456\u0432 \u0432\u0438\u043C\u043A\u043D\u0435\u043D\u043E",
        "zh-cn": "\u72B6\u6001\u6BD4\u8F83\u5DF2\u7981\u7528"
      },
      desc: "State comparison disabled",
      read: true,
      write: true,
      def: "\u{1F534}",
      states
    };
    await this.createDataPoint("html.icon_state_check_no", common, "state");
    val = await this.adapter.getStateAsync("html.icon_state_check_no");
    this.htmlVal.icon_state_check_no = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "Icon for TRUE",
        de: "Icon f\xFCr TRUE",
        ru: "\u0418\u043A\u043E\u043D\u0430 \u0434\u043B\u044F TRUE",
        pt: "\xCDcone para TRUE",
        nl: "Pictogram voor WAAR",
        fr: "Ic\xF4ne pour TRUE",
        it: "Icona per TRUE",
        es: "Icono para TRUE",
        pl: "Ikona dla TRUE",
        uk: "\u0406\u043A\u043E\u043D\u0430 \u0434\u043B\u044F TRUE",
        "zh-cn": "TRUE \u56FE\u6807"
      },
      desc: "Icon for TRUE",
      read: true,
      write: true,
      def: "\u{1F7E1}",
      states
    };
    await this.createDataPoint("html.icon_true", common, "state");
    val = await this.adapter.getStateAsync("html.icon_true");
    this.htmlVal.icon_true = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "Icon for FALSE",
        de: "Icon f\xFCr FALSE",
        ru: "\u0418\u043A\u043E\u043D\u0430 \u0434\u043B\u044F FALSE",
        pt: "\xCDcone para FALSE",
        nl: "Pictogram voor FALSE",
        fr: "Ic\xF4ne pour FALSE",
        it: "Icona per FALSE",
        es: "Icono para FALSE",
        pl: "Ikona FALSE",
        uk: "\u0406\u043A\u043E\u043D\u0430 \u043F\u0456\u0434 FALSE",
        "zh-cn": "FALSE \u56FE\u6807"
      },
      desc: "Icon for FALSE",
      read: true,
      write: true,
      def: "\u26AA",
      states
    };
    await this.createDataPoint("html.icon_false", common, "state");
    val = await this.adapter.getStateAsync("html.icon_false");
    this.htmlVal.icon_false = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "Switch symbol",
        de: "Schaltersymbol",
        ru: "\u0421\u0438\u043C\u0432\u043E\u043B \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0442\u0435\u043B\u044F",
        pt: "S\xEDmbolo de interruptor",
        nl: "Switch symbool",
        fr: "Symbole de commutation",
        it: "Simbolo di commutazione",
        es: "Signatura del interruptor",
        pl: "Symbol prze\u0142\u0105cznika",
        uk: "\u0421\u0438\u043C\u0432\u043E\u043B \u043F\u0435\u0440\u0435\u043C\u0438\u043A\u0430\u043D\u043D\u044F",
        "zh-cn": "\u5207\u6362\u7B26\u53F7"
      },
      desc: "Switch symbol",
      read: true,
      write: true,
      def: "\u23F1",
      states
    };
    await this.createDataPoint("html.icon_switch_symbol", common, "state");
    val = await this.adapter.getStateAsync("html.icon_switch_symbol");
    this.htmlVal.icon_switch_symbol = val == null ? void 0 : val.val;
    const text = ["Schedule", "Devices", "Switch", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    for (let i = 1; i < 11; i++) {
      common = {
        type: "string",
        role: "state",
        name: {
          en: `Column ${i} align`,
          de: `Spalte ${i} ausrichten`,
          ru: `\u041A\u043E\u043B\u043E\u043D\u043A\u0430 ${i}`,
          pt: `Coluna ${i}`,
          nl: `Kolom ${i} uitlijnen`,
          fr: `Colonne ${i} aligner`,
          it: `Colonna ${i} allineare`,
          es: `Columna ${i} alinear`,
          pl: `Kolumna ${i} wyr\xF3wna\u0107`,
          uk: `\u041A\u043E\u043B\u043E\u043D\u043A\u0430 ${i} \u0432\u0438\u0440\u0456\u0432\u043D\u044E\u0432\u0430\u043D\u043D\u044F`,
          "zh-cn": `\u5217 ${i} \u5BF9\u9F50`
        },
        desc: `column ${i} align`,
        read: true,
        write: true,
        def: "center",
        states: ["center", "left", "right", "auto"]
      };
      await this.createDataPoint(`html.column_align_${i.toString().padStart(2, "0")}`, common, "state");
      val = await this.adapter.getStateAsync(`html.column_align_${i.toString().padStart(2, "0")}`);
      this.htmlVal[`column_align_${i.toString().padStart(2, "0")}`] = val == null ? void 0 : val.val;
      common = {
        type: "string",
        role: "state",
        name: {
          en: `Column ${i} width (auto, px or %)`,
          de: `Spalte ${i} Breite (auto, px oder %)`,
          ru: `\u041A\u043E\u043B\u043E\u043D\u043A\u0430 ${i} \u0428\u0438\u0440\u0438\u043D\u0430 (\u0430\u0432\u0442\u043E, px \u0438\u043B\u0438 %)`,
          pt: `Coluna ${i} largura (auto, px ou %)`,
          nl: `Kolom ${i} breedte (auto, px of %)`,
          fr: `Colonne {i} largeur (auto, px ou %)`,
          it: `Colonna ${i} larghezza (auto, px o %)`,
          es: `Columna ${i} ancho (auto, px o %)`,
          pl: `Kolumna ${i} szeroko\u015B\u0107 (auto, px lub%)`,
          uk: `\u041A\u043E\u043B\u043E\u043D\u043A\u0430 ${i} \u0448\u0438\u0440\u0438\u043D\u0430 (auto, px \u0430\u0431\u043E %)`,
          "zh-cn": `\u680F ${i} \u5BBD\u5EA6 (\u81EA\u52A8\u3001 px \u6216%)`
        },
        desc: `Column ${i} width (auto, px or %)`,
        read: true,
        write: true,
        def: "auto"
      };
      await this.createDataPoint(`html.column_width_${i.toString().padStart(2, "0")}`, common, "state");
      val = await this.adapter.getStateAsync(`html.column_width_${i.toString().padStart(2, "0")}`);
      this.htmlVal[`column_width_${i.toString().padStart(2, "0")}`] = val == null ? void 0 : val.val;
      common = {
        type: "string",
        role: "state",
        name: {
          en: `Column ${i} text`,
          de: `Spalte ${i} Text`,
          ru: `\u041A\u043E\u043B\u043E\u043D\u043A\u0430 ${i} \u0442\u0435\u043A\u0441\u0442`,
          pt: `Coluna ${i} texto`,
          nl: `Kolom ${i} tekst`,
          fr: `Texte de la colonne ${i}`,
          it: `Colonna ${i} testo`,
          es: `Columna ${i} texto`,
          pl: `Tekst w kolumnie ${i}`,
          uk: `\u041A\u043E\u043B\u043E\u043D\u043A\u0430 ${i} \u0442\u0435\u043A\u0441\u0442`,
          "zh-cn": `\u5217 ${i} \u6587\u672C`
        },
        desc: `Column ${i} text`,
        read: true,
        write: true,
        def: text[i - 1]
      };
      await this.createDataPoint(`html.column_text_${i.toString().padStart(2, "0")}`, common, "state");
      val = await this.adapter.getStateAsync(`html.column_text_${i.toString().padStart(2, "0")}`);
      this.htmlVal[`column_text_${i.toString().padStart(2, "0")}`] = val == null ? void 0 : val.val;
      common = {
        type: "string",
        role: "state",
        name: {
          en: `Alignment of row in column ${i}`,
          de: `Ausrichtung der Zeile in Spalte ${i}`,
          ru: `\u0420\u0430\u0437\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u0441\u0442\u0440\u043E\u043A\u0438 \u0432 \u043A\u043E\u043B\u043E\u043D\u043A\u0435 ${i}`,
          pt: `Alinhamento da linha na coluna ${i}`,
          nl: `Uitlijning van rij in kolom ${i}`,
          fr: `Alignement de la ligne dans la colonne ${i}`,
          it: `Allineamento della riga nella colonna ${i}`,
          es: `Alineaci\xF3n de fila en la columna ${i}`,
          pl: `Dostosowanie wiersza w kolumnie ${i}`,
          uk: `\u0412\u0438\u0440\u0456\u0432\u043D\u044E\u0432\u0430\u043D\u043D\u044F \u0440\u044F\u0434\u0443 \u0432 \u043A\u043E\u043B\u043E\u043D\u0446\u0456 ${i}`,
          "zh-cn": `\u680F ${i} \u884C\u5BF9\u9F50`
        },
        desc: `Alignment of row in column ${i}`,
        read: true,
        write: true,
        def: "left",
        states: ["center", "left", "right", "auto"]
      };
      await this.createDataPoint(`html.column_align_row_${i.toString().padStart(2, "0")}`, common, "state");
      val = await this.adapter.getStateAsync(`html.column_align_row_${i.toString().padStart(2, "0")}`);
      this.htmlVal[`column_align_row_${i.toString().padStart(2, "0")}`] = val == null ? void 0 : val.val;
    }
    common = {
      type: "string",
      role: "state",
      name: {
        en: "Background color (even)",
        de: "Hintergrundfarbe (gerade)",
        ru: "\u0424\u043E\u043D\u043E\u0432\u044B\u0439 \u0446\u0432\u0435\u0442 (\u0434\u0430\u0436\u0435)",
        pt: "Cor de fundo (even)",
        nl: "Achtergrondkleur (even)",
        fr: "Couleur de fond (m\xEAme)",
        it: "Colore sfondo (anche)",
        es: "Color de fondo (incluso)",
        pl: "Kolor t\u0142a (parzysty)",
        uk: "\u041A\u043E\u043B\u0456\u0440 \u0444\u043E\u043D\u0443 (\u043D\u0430\u0432\u0456\u0442\u044C)",
        "zh-cn": "\u80CC\u666F\u989C\u8272( \u5076\u6570)"
      },
      desc: "Background color (even)",
      read: true,
      write: true,
      def: "#1E1E1E"
    };
    await this.createDataPoint("html.background_color_even", common, "state");
    val = await this.adapter.getStateAsync("html.background_color_even");
    this.htmlVal.background_color_even = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "Background color (odd)",
        de: "Hintergrundfarbe (ungerade)",
        ru: "\u0424\u043E\u043D\u043E\u0432\u044B\u0439 \u0446\u0432\u0435\u0442 (odd)",
        pt: "Cor de fundo (odd)",
        nl: "Achtergrondkleur (odd)",
        fr: "Couleur de fond (odd)",
        it: "Colore dello sfondo (odd)",
        es: "Color de fondo (odd)",
        pl: "Kolor t\u0142a (nieparzysty)",
        uk: "\u041A\u043E\u043B\u0456\u0440 \u0444\u043E\u043D\u0443 (\u043E\u0434)",
        "zh-cn": "\u80CC\u666F\u989C\u8272( \u5947\u6570)"
      },
      desc: "Background color (odd)",
      read: true,
      write: true,
      def: "#18171C"
    };
    await this.createDataPoint("html.background_color_odd", common, "state");
    val = await this.adapter.getStateAsync("html.background_color_odd");
    this.htmlVal.background_color_odd = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "Background color trigger",
        de: "Hintergrundfarbe Trigger",
        ru: "\u0424\u043E\u043D\u043E\u0432\u044B\u0439 \u0446\u0432\u0435\u0442 \u0442\u0440\u0438\u0433\u0433\u0435\u0440",
        pt: "Gatilho de cor de fundo",
        nl: "Achtergrondkleur",
        fr: "D\xE9clencheur de couleur de fond",
        it: "Innesco del colore di sfondo",
        es: "Color de fondo disparador",
        pl: "Kolor t\u0142a wyzwalacz",
        uk: "\u041F\u0456\u0434\u0437\u0435\u043C\u043D\u0438\u0439 \u043A\u043E\u043B\u0456\u0440\u043D\u0438\u0439 \u0442\u0440\u0438\u0433\u0435\u0440",
        "zh-cn": "\u80CC\u666F\u989C\u8272\u89E6\u53D1"
      },
      desc: "Background color trigger",
      read: true,
      write: true,
      def: "#000000"
    };
    await this.createDataPoint("html.background_color_trigger", common, "state");
    val = await this.adapter.getStateAsync("html.background_color_trigger");
    this.htmlVal.background_color_trigger = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "Background color body",
        de: "Hintergrundfarbe Body",
        ru: "\u0424\u043E\u043D\u043E\u0432\u044B\u0439 \u0446\u0432\u0435\u0442 \u0442\u0435\u043B\u0430",
        pt: "Corpo de cor de fundo",
        nl: "Achtergrondkleur",
        fr: "Corps de couleur de fond",
        it: "Corpo di colore di sfondo",
        es: "Cuerpo de color de fondo",
        pl: "Kolor t\u0142a cia\u0142a",
        uk: "\u041F\u0456\u0434\u0437\u0435\u043C\u043D\u0438\u0439 \u043A\u043E\u043B\u0456\u0440 \u0442\u0456\u043B\u0430",
        "zh-cn": "\u80CC\u666F\u989C\u8272\u6B63\u6587"
      },
      desc: "Background color body",
      read: true,
      write: true,
      def: "#000000"
    };
    await this.createDataPoint("html.background_color_body", common, "state");
    val = await this.adapter.getStateAsync("html.background_color_body");
    this.htmlVal.background_color_body = val == null ? void 0 : val.val;
    common = {
      type: "boolean",
      role: "switch",
      name: {
        en: "Disable div.containers for jarvis",
        de: "Div.container f\xFCr Jarvis deaktivieren",
        ru: "\u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C div.containers \u0434\u043B\u044F jarvis",
        pt: "Desativar div.containers para jarvis",
        nl: "Disable div-containers",
        fr: "Disable div.containers for jarvis",
        it: "Disabilita div.containers per jarvis",
        es: "Desactivar div.containers para jarvis",
        pl: "Niezdolne div.containery dla jarvis\xF3w",
        uk: "\u0412\u0438\u043C\u043A\u043D\u0435\u043D\u0456 \u0434\u0438\u0432.\u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u0438 \u0434\u043B\u044F \u0431\u0430\u043D\u0456",
        "zh-cn": "A. \u53EF\u4EE5\u533A\u5206\u7684 div. jarvis\u7684\u62D8\u7559\u8005"
      },
      desc: "Disable div.containers for jarvis",
      read: true,
      write: true,
      def: false
    };
    await this.createDataPoint("html.jarvis", common, "state");
    val = await this.adapter.getStateAsync("html.jarvis");
    this.htmlVal.jarvis = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "Weekdays mouseover color",
        de: "Wochentage Mausover Farbe",
        ru: "\u0426\u0432\u0435\u0442 \u043C\u044B\u0448\u043A\u0438",
        pt: "Semanas mouseover cor",
        nl: "Weekdagen muisover kleur",
        fr: "La couleur de la souris en semaine",
        it: "I giorni feriali il colore del mouseover",
        es: "D\xEDas semanales rat\xF3nover color",
        pl: "Cotygodniowy kolor mouseover",
        uk: "\u0414\u0435\u043D\u044C \u043D\u0430\u0440\u043E\u0434\u0436\u0435\u043D\u043D\u044F \u041A\u043E\u043B\u0456\u0440",
        "zh-cn": "\u5468\u65E5\u9F20\u6807\u7FFB\u8F6C\u989C\u8272"
      },
      desc: "Weekdays mouseover color",
      read: true,
      write: true,
      def: "blue"
    };
    await this.createDataPoint("html.background_color_weekdays_hover", common, "state");
    val = await this.adapter.getStateAsync("html.background_color_weekdays_hover");
    this.htmlVal.background_color_weekdays_hover = val == null ? void 0 : val.val;
    common = {
      type: "string",
      role: "state",
      name: {
        en: "HTML code",
        de: "HTML-Code",
        ru: "HTML \u043A\u043E\u0434",
        pt: "C\xF3digo HTML",
        nl: "HTML-code",
        fr: "Code HTML",
        it: "Codice HTML",
        es: "C\xF3digo HTML",
        pl: "Kod HTML",
        uk: "\u041A\u043E\u0434 HTML",
        "zh-cn": "HTML \u4EE3\u7801"
      },
      desc: "HTML code",
      read: true,
      write: true,
      def: ""
    };
    await this.createDataPoint("html.html_code", common, "state");
    val = await this.adapter.getStateAsync("html.html_code");
    this.htmlVal.html_code = val == null ? void 0 : val.val;
  }
  loadTitle(val) {
    const lang = {
      activated: {
        en: "State comparison activated",
        de: "Zustandsvergleich aktiviert",
        ru: "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0439 \u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D\u043E",
        pt: "Compara\xE7\xE3o de estados ativada",
        nl: "Statusvergelijking geactiveerd",
        fr: "Comparaison d'\xE9tat activ\xE9e",
        it: "Confronto di stato attivato",
        es: "Comparaci\xF3n de estados activada",
        pl: "Por\xF3wnanie stan\xF3w zosta\u0142o aktywowane",
        uk: "\u041F\u043E\u0440\u0456\u0432\u043D\u044F\u043D\u043D\u044F \u0441\u0442\u0430\u043D\u0456\u0432 \u0430\u043A\u0442\u0438\u0432\u043E\u0432\u0430\u043D\u043E",
        "zh-cn": "\u72B6\u6001\u6BD4\u8F83\u5DF2\u6FC0\u6D3B"
      },
      disabled: {
        en: "State comparison disabled",
        de: "Statusvergleich deaktiviert",
        ru: "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0439 \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u043E",
        pt: "Compara\xE7\xE3o de estados desabilitada",
        nl: "Staatsvergelijking uitgeschakeld",
        fr: "Comparaison d'\xE9tat d\xE9sactiv\xE9e",
        it: "Confronto di stato disabilitato",
        es: "Comparaci\xF3n de estados deshabilitada",
        pl: "Por\xF3wnanie stan\xF3w wy\u0142\u0105czone",
        uk: "\u041F\u043E\u0440\u0456\u0432\u043D\u044F\u043D\u043D\u044F \u0441\u0442\u0430\u043D\u0456\u0432 \u0432\u0438\u043C\u043A\u043D\u0435\u043D\u043E",
        "zh-cn": "\u72B6\u6001\u6BD4\u8F83\u5DF2\u7981\u7528"
      }
    };
    return lang[val][this.lang];
  }
  async createDataPoint(ident, common, types, native = null) {
    try {
      const nativvalue = !native ? { native: {} } : { native };
      const obj = await this.adapter.getObjectAsync(ident);
      const objs = obj;
      if (!objs) {
        await this.adapter.setObjectNotExistsAsync(ident, {
          type: types,
          common,
          ...nativvalue
        }).catch((error) => {
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
          await this.adapter.setObjectAsync(ident, objs);
        }
      }
    } catch (error) {
      this.adapter.log.warn(`createDataPoint e: ${error.name}: ${error.message}`);
    }
  }
  /**
   * Update after state change
   */
  async updateStateHTML() {
    if (!this.adapter.config.usehtml) {
      return;
    }
    if (this.works) {
      return;
    }
    this.works = true;
    try {
      await this.sleep(60 * 1e3);
      await this.updateHTML();
      this.works = false;
    } catch {
      this.works = false;
    }
  }
  /**
   * destroy all
   */
  destroy() {
    this.delayTimeout && this.adapter.clearTimeout(this.delayTimeout);
    this.delayTimeout = void 0;
    return Promise.resolve(true);
  }
  /**
   * @param ms milliseconds
   */
  sleep(ms) {
    return new Promise((resolve) => {
      this.delayTimeout = this.adapter.setTimeout(resolve, ms);
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  VisHtmlTable
});
//# sourceMappingURL=VisHtmlTable.js.map
