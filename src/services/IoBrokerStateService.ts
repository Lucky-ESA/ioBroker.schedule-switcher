import { StateService } from "./StateService";

export class IoBrokerStateService implements StateService {
    private adapter: ioBroker.Adapter;
    private delayTimeout: any;
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

    async extendObject(id: string, value: any): Promise<any> {
        if (!id || !value) {
            throw new Error("State or Object is empty! - extendObject");
        }
        this.checkId(id);
        await this.adapter.extendObject(id, value);
    }

    async setState(id: string, value: string | number | boolean, ack = true): Promise<any> {
        this.checkId(id);
        await this.adapter.setState(id, value, ack);
    }

    async setForeignState(id: string, value: string | number | boolean, trigger: any): Promise<any> {
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
        if (this.adapter.config.history > 0) {
            await this.setHistory(id as string, value as string, trigger as any);
        }
        this.checkId(id);
        this.adapter.log.debug(`Setting state ${id} with value ${value?.toString()}`);
        this.adapter.setForeignState(id, value, false);
    }

    async setHistory(id: string, value: string | number | boolean, trigger: any): Promise<any> {
        if (!trigger || trigger.id == null) return;
        let history_newvalue = [];
        const history_value = await this.getState(`history`);
        try {
            if (history_value != null && typeof history_value == "string") {
                history_newvalue = JSON.parse(history_value);
            } else {
                history_newvalue = [];
            }
        } catch (e) {
            history_newvalue = [];
        }
        if (Object.keys(history_newvalue).length > this.adapter.config.history) {
            history_newvalue.pop();
        }
        const new_data = {
            setObjectId: id,
            objectId: trigger.objectId ? trigger.objectId : "unknown",
            value: value.toString(),
            trigger: trigger.trigger ? trigger.trigger : "unknown",
            astroTime: trigger.astroTime ? trigger.astroTime : "unknown",
            shift: trigger.shift ? trigger.shift : 0,
            date: trigger.date ? trigger.date : 0,
            hour: trigger.hour ? trigger.hour : 0,
            minute: trigger.minute ? trigger.minute : 0,
            weekdays: trigger.weekdays ? trigger.weekdays : [],
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

    async getForeignState(id: string): Promise<any> {
        return new Promise((resolve, _) => {
            this.checkId(id);
            this.adapter.getForeignState(id, (err, state) => {
                if (err || state == null) {
                    this.adapter.log.error(`Requested state ${id} returned null/undefined!`);
                }
                resolve(state?.val);
            });
        });
    }

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

    public delay(ms: number): Promise<void> {
        return new Promise((resolve) => {
            this.delayTimeout = this.adapter.setTimeout(resolve, ms);
        });
    }

    public destroy(): void {
        this.delayTimeout && this.adapter.clearTimeout(this.delayTimeout);
    }

    private checkId(id: string): void {
        if (id == null || id.length === 0) {
            throw new Error("id may not be null or empty.");
        }
    }
}
