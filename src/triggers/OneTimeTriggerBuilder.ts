import type { Action } from "../types/Action";
import type { Builder } from "../types/Builder";
import { OneTimeTrigger } from "./OneTimeTrigger";

/**
 * OneTimeTriggerBuilder
 */
export class OneTimeTriggerBuilder implements Builder<OneTimeTrigger> {
    private action: Action | null = null;
    private id = "0";
    private objectId = 0;
    private valueCheck = false;
    private timedate = false;
    private date: Date | null = null;
    private onDestroy: (() => void) | null = null;

    /**
     * @param action Action
     * @returns this
     */
    public setAction(action: Action): OneTimeTriggerBuilder {
        this.action = action;
        return this;
    }

    /**
     * @param id ID
     * @returns this
     */
    public setId(id: string): OneTimeTriggerBuilder {
        this.id = id;
        return this;
    }

    /**
     * @param date Date
     * @returns this
     */
    public setDate(date: Date): OneTimeTriggerBuilder {
        this.date = date;
        return this;
    }

    /**
     * @param objectId ID
     * @returns this
     */
    public setObjectId(objectId: number): OneTimeTriggerBuilder {
        this.objectId = objectId;
        return this;
    }

    /**
     * @param valueCheck value check true/false
     * @returns this
     */
    public setValueCheck(valueCheck: boolean): OneTimeTriggerBuilder {
        this.valueCheck = valueCheck;
        return this;
    }

    /**
     * @param timedate Time
     * @returns this
     */
    public setTimeDate(timedate: boolean): OneTimeTriggerBuilder {
        this.timedate = timedate;
        return this;
    }

    /**
     * @param onDestroy Destroy
     * @returns this
     */
    public setOnDestroy(onDestroy: () => void): OneTimeTriggerBuilder {
        this.onDestroy = onDestroy;
        return this;
    }

    /**
     * @returns OneTimeTrigger
     */
    public build(): OneTimeTrigger {
        return new OneTimeTrigger(
            this.id,
            this.objectId,
            this.valueCheck,
            this.timedate,
            this.action as Action,
            this.date as Date,
            this.onDestroy,
        );
    }
}
