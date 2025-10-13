import type { StateService } from "./StateService";

/**
 * IoBrokerStateService
 */
export class IoBrokerStateService implements StateService {
    private adapter: ioBroker.Adapter;
    private delayTimeout: ioBroker.Timeout | undefined;
    /**
     * @param adapter ioBroker
     * @param checkTime check
     * @param mergeTime merge
     */
    constructor(
        adapter: ioBroker.Adapter,
        private checkTime: number = 0,
        private mergeTime: number = 0,
    ) {
        if (!adapter) {
            throw new Error("adapter may not be null.");
        }
        this.adapter = adapter;
        this.checkTime = Date.now();
        this.mergeTime = 0;
        this.delayTimeout = undefined;
    }

    /**
     * @param id ID
     * @param value Values
     */
    async extendObject(id: string, value: any): Promise<any> {
        if (!id || !value) {
            throw new Error("State or Object is empty! - extendObject");
        }
        this.checkId(id);
        await this.adapter.extendObject(id, value);
    }

    /**
     * @param id ID
     * @param value Values
     * @param ack Ack flag
     */
    async setState(id: string, value: string | number | boolean, ack = true): Promise<any> {
        this.checkId(id);
        await this.adapter.setState(id, { val: value, ack: ack });
    }

    /**
     * @param id ID
     * @param value Values
     * @param trigger Trigger
     */
    async setForeignState(id: string, value: string | number | boolean | null, trigger: any): Promise<any> {
        this.adapter.log.debug(`TRIGGER SET: ${JSON.stringify(trigger)}`);
        const diffTime = Date.now() - this.checkTime;
        this.checkTime = Date.now();
        this.adapter.log.debug(`DIFF: ${diffTime}`);
        if (this.adapter.config.switch_delay > 0 && this.adapter.config.switch_delay > diffTime) {
            this.adapter.log.debug(`Start Sleep`);
            this.mergeTime += this.adapter.config.switch_delay;
            await this.delay(this.mergeTime);
        } else {
            this.mergeTime = 0;
        }
        const old_value = await this.adapter.getForeignStateAsync(id);
        const old_val = old_value == null ? null : old_value.val;
        let change_val = false;
        this.adapter.log.debug(trigger.valueCheck);
        if (trigger.valueCheck) {
            if (JSON.stringify(value) === JSON.stringify(old_val)) {
                this.adapter.log.debug(`Set not change!`);
                change_val = true;
            }
        }
        if (this.adapter.config.history > 0) {
            await this.setHistory(id, value, trigger, old_val, change_val);
        }
        this.checkId(id);
        if (!change_val) {
            this.adapter.log.debug(`Set state ${id} with value ${value?.toString()} - ${old_val?.toString()}`);
            this.adapter.setForeignState(id, value, false);
        } else {
            this.adapter.log.debug(`Set not state ${id} with value ${value?.toString()} - ${old_val?.toString()}`);
        }
    }

    /**
     * @param id ID
     * @param value Values
     * @param trigger Trigger
     * @param old_value Actual value
     * @param setVal Set new value
     */
    async setHistory(
        id: string,
        value: string | number | boolean | null,
        trigger: any,
        old_value: string | number | boolean | null,
        setVal: boolean,
    ): Promise<any> {
        if (!trigger || trigger.id != null) {
            let history_newvalue = [];
            const history_value = await this.getState(`history`);
            try {
                if (history_value != null && typeof history_value == "string") {
                    history_newvalue = JSON.parse(history_value);
                } else {
                    history_newvalue = [];
                }
            } catch {
                history_newvalue = [];
            }
            if (Object.keys(history_newvalue).length > this.adapter.config.history) {
                history_newvalue.pop();
            }
            const new_data = {
                setObjectId: id,
                objectId: trigger.objectId != null ? trigger.objectId : "unknown",
                value: value,
                old_value: old_value,
                setValue: setVal,
                trigger: trigger.trigger != null ? trigger.trigger : "unknown",
                astroTime: trigger.astroTime != null ? trigger.astroTime : "unknown",
                shift: trigger.shift != null ? trigger.shift : 0,
                date: trigger.date != null ? trigger.date : 0,
                hour: trigger.hour != null ? trigger.hour : 0,
                minute: trigger.minute != null ? trigger.minute : 0,
                weekdays: trigger.weekdays != null ? trigger.weekdays : [],
                time: Date.now(),
            };
            history_newvalue.push(new_data);
            history_newvalue.sort((a: any, b: any) => {
                if (a.time > b.time) {
                    return -1;
                }
            });
            await this.setState(`history`, JSON.stringify(history_newvalue), true);
        }
    }

    /**
     * @param id ID
     */
    async getForeignState(id: string): Promise<any> {
        return new Promise((resolve, _) => {
            this.checkId(id);
            void this.adapter.getForeignState(id, (err, state) => {
                if (err || state == null) {
                    this.adapter.log.error(`Requested state ${id} returned null/undefined!`);
                }
                resolve(state?.val);
            });
        });
    }

    /**
     * @param id ID
     */
    async getState(id: string): Promise<any> {
        return new Promise((resolve, _) => {
            this.checkId(id);
            this.adapter.getState(id, (err, state) => {
                if (err || state == null) {
                    this.adapter.log.error(`Requested getState ${id} returned null/undefined!`);
                }
                resolve(state?.val);
            });
        });
    }

    /**
     * @param ms milliseconds
     */
    public delay(ms: number): Promise<void> {
        return new Promise(resolve => {
            this.delayTimeout = this.adapter.setTimeout(resolve, ms);
        });
    }

    /**
     * destroy all
     */
    public destroy(): Promise<boolean> {
        this.delayTimeout && this.adapter.clearTimeout(this.delayTimeout);
        this.delayTimeout = undefined;
        return Promise.resolve(true);
    }

    private checkId(id: string): void {
        if (id == null || id.length === 0) {
            throw new Error("id may not be null or empty.");
        }
    }
}
