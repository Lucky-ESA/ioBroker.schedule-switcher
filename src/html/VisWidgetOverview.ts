import type { WidgetOverview } from "./widgetOverview";

/**
 * VisWidgetOverview
 */
export class VisWidgetOverview implements WidgetOverview {
    private adapter: ioBroker.Adapter;

    /**
     * @param adapter ioBroker
     */
    constructor(adapter: ioBroker.Adapter) {
        this.adapter = adapter;
    }

    /**
     * createOverview
     */
    public async createOverview(): Promise<void> {
        this.adapter.log.debug(`Start update Widget overview!`);
        const currentStates: any = await this.adapter.getStatesAsync(
            `schedule-switcher.${this.adapter.instance}.onoff.*`,
        );
        let html_code = "";
        let counter = 0;
        for (const stateId in currentStates) {
            if (stateId.toString().indexOf(".view") !== -1 && currentStates[stateId].val.startsWith("{")) {
                html_code += this.createHeader(stateId);
                const val = JSON.parse(currentStates[stateId].val);
                for (const vis in val) {
                    for (const views in val[vis]) {
                        for (const widget in val[vis][views]) {
                            const json = val[vis][views][widget];
                            ++counter;
                            const isodd = counter % 2 != 0 ? "#1E1E1E" : "#18171C";
                            html_code += this.createRow(isodd, json, vis, views, widget);
                        }
                    }
                }
            }
        }
        await this.createHTML(html_code, counter);
    }

    /**
     * createHeader
     *
     * @param dataId Data Id
     */
    private createHeader(dataId: string): string {
        return `
            <tr style="background-color: #000000;">
                <td colspan="13" scope="colgroup">
                <p style="color: #ffffff; font-family:"Helvetica"; 
                font-size:20px; font-weight:normal">${dataId}</p></td>
            </tr>`;
    }

    /**
     * createHTML
     *
     * @param rows rows
     * @param counter counter for footer
     */
    private async createHTML(rows: string, counter: number): Promise<void> {
        const htmlStart = `
        <title>Schedule-Switcher Widget Overview</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
        <style>
        * {
            margin: 0;
        }
        body {
            background-color: #000000; margin: 0 auto;
        }
        p {
            padding-top: 10px; padding-bottom: 10px; text-align: center;
        }
        #updatetime:hover {
            cursor: pointer;
        }
        td {
            padding:6px; border:0px solid #424242; 
            border-right:1px solid #424242;
            border-bottom:1px solid #424242;
        }
        table {
            width: auto;
            margin: center;
            border:1px solid #424242;
            border-spacing: 6px;
            border-collapse: collapse;
        }
        div.container {
            align-items: center;
            justify-content: center;
        }
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
        <div class="container">
        <table style=" width:auto;
        border:2px; border-color: #424242; 
        font-size:15px; font-family:Helvetica; 
        background-image: linear-gradient(42deg, #BDBDBD, #BDBDBD);">
        <thead>
        <tr>
        <th colspan="13" scope="colgroup">
        <p style="color: #ffffff; font-family:Helvetica; 
        font-size:20px; font-weight:normal">Widget Value Overview</p></th>
        </tr>
        <tr style="color: #ffffff; height:35px;
        font-size: 16px; font-weight: normal; 
        border-bottom: 3px solid #ffffff">
        <th title="VIS" style="text-align: center; width:auto">
        VIS
        </th>
        <th title="View" style="text-align:center; width:auto">
        View
        </th>
        <th title="Widget" style="text-align:center; width:auto">
        Widget
        </th>
        <th title="Type" style="text-align:center; width:auto">
        Type
        </th>
        <th title="Value off" style="text-align:center; width:auto">
        Off
        </th>
        <th title="Value on" style="text-align:center; width:auto">
        On
        </th>
        <th title="Name of 'off' replace" style="text-align:center; width:auto">
        Replace Off
        </th>
        <th title="Name of 'on' replace" style="text-align:center; width:auto">
        Replace On
        </th>
        <th title="Enabled ID" style="text-align:center; width:auto">
        Enabled ID
        </th>
        <th title="State count" style="text-align:center; width:auto">
        State count
        </th>
        <th title="Object-Id" style="text-align:center; width:auto">
        Object-Id
        </th>
        <th title="Condition count" style="text-align:center; width:auto">
        Condition count
        </th>
        <th title="Condition Object-Id" style="text-align:center; width:auto">
        Object-Id
        </th>
        </tr>
        </thead>
        <tfoot>
        <tr>
        <th colspan="13" scope="colgroup">
        <p style="color: #ffffff; font-family: Helvetica; 
        font-size:20px; font-weight: normal">
        Widgets total ${counter}
        </p></th>
        </tr>
        </tfoot>
        <tbody>
        ${rows}
        </tbody>
        </table></div>`;
        await this.adapter.setState(`widgetOverview`, {
            val: htmlStart,
            ack: true,
        });
    }

    /**
     * createRow
     *
     * @param isodd bg color
     * @param json valus
     * @param vis vis-2 or vis
     * @param view view name
     * @param widget widget id
     */
    private createRow(isodd: string, json: any, vis: string, view: string, widget: string): string {
        let count = 0;
        const countCondition = json.condition.length;
        let stateCondition = "";
        for (const id of json.condition) {
            for (const val in id) {
                ++count;
                if (count == countCondition) {
                    stateCondition += `${id[val]}`;
                } else {
                    stateCondition += `${id[val]}<br/>`;
                }
            }
        }
        count = 0;
        const countStateId = json.condition.length;
        let stateStateId = "";
        for (const id of json.state) {
            for (const val in id) {
                ++count;
                if (count == countStateId) {
                    stateStateId += `${id[val]}`;
                } else {
                    stateStateId += `${id[val]}<br/>`;
                }
            }
        }
        const offValue = json.offValue ? json.offValue : "empty";
        const onValue = json.onValue ? json.onValue : "empty";
        const enabled = json.enabled ? json.enabled.replace("schedule-switcher.", "") : "empty";
        const newOff = json.newOff ? json.newOff : "empty";
        const newOn = json.newOn ? json.newOn : "empty";
        return `
        <tr style="background-color:${isodd}; 
        color:yellow;
        font-weight:"bold";
        font-size:15px;">
            <td title="${vis}" style="text-align:center">${vis}</td>
            <td title="${view}" style="text-align:center">${view}</td>
            <td title="${widget}" style="text-align:center">${widget}</td>
            <td title="${json.valueType}" style="text-align:center">${json.valueType}</td>
            <td title="${offValue}" style="text-align:center">${offValue}</td>
            <td title="${onValue}" style="text-align:center">${onValue}</td>
            <td title="${newOff}" style="text-align:center">${newOff}</td>
            <td title="${newOn}" style="text-align:center">${newOn}</td>
            <td title="${enabled}" style="text-align:center">${enabled}</td>
            <td title="${json.stateCount}" style="text-align:center">${json.stateCount}</td>
            <td title="${stateStateId}" style="text-align:center">${stateStateId}</td>
            <td title="${json.conditionCount}" style="text-align:center">${json.conditionCount}</td>
            <td title="${stateCondition}" style="text-align:center">${stateCondition}</td>
        </tr>`;
    }
}
