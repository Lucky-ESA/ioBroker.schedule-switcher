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
        await this.adapter.extendObject(id, value);
    }

    setState(id: string, value: string | number | boolean, ack = true): void {
        this.checkId(id);
        this.adapter.setState(id, value, ack);
    }

    async setForeignState(id: string, value: string | number | boolean): Promise<any> {
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
        this.checkId(id);
        this.adapter.log.debug(`Setting state ${id} with value ${value?.toString()}`);
        this.adapter.setForeignState(id, value, false);
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
            this.adapter.getForeignState(id, (err, state) => {
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
