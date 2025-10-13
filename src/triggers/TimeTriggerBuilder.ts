import type { Action } from "../actions/Action";
import type { Builder } from "../Builder";
import { DailyTriggerBuilder } from "./DailyTriggerBuilder";
import { TimeTrigger } from "./TimeTrigger";
import type { Weekday } from "./Weekday";

/**
 * TimeTriggerBuilder
 */
export class TimeTriggerBuilder extends DailyTriggerBuilder implements Builder<TimeTrigger> {
    private hour = 0;
    private minute = 0;
    private objectId = 0;
    private todayTrigger = {};
    private valueCheck = false;

    /**
     * @param hour Hour
     * @returns this
     */
    public setHour(hour: number): TimeTriggerBuilder {
        this.hour = hour;
        return this;
    }

    /**
     * @param minute Minute
     * @returns this
     */
    public setMinute(minute: number): TimeTriggerBuilder {
        this.minute = minute;
        return this;
    }

    /**
     * @param objectId Object ID
     * @returns this
     */
    public setObjectId(objectId: number): TimeTriggerBuilder {
        this.objectId = objectId;
        return this;
    }

    /**
     * @param valueCheck check value true/false
     * @returns this
     */
    public setValueCheck(valueCheck: boolean): TimeTriggerBuilder {
        this.valueCheck = valueCheck;
        return this;
    }

    /**
     * @param todayTrigger Trigger
     * @returns this
     */
    public setTodayTrigger(todayTrigger: any): TimeTriggerBuilder {
        this.todayTrigger = todayTrigger;
        return this;
    }

    /**
     * @param action Action
     * @returns this
     */
    public setAction(action: Action): TimeTriggerBuilder {
        super.setAction(action);
        return this;
    }

    /**
     * @param id ID
     * @returns this
     */
    public setId(id: string): TimeTriggerBuilder {
        super.setId(id);
        return this;
    }

    /**
     * @param weekdays Weekdays
     * @returns this
     */
    public setWeekdays(weekdays: Weekday[]): TimeTriggerBuilder {
        super.setWeekdays(weekdays);
        return this;
    }

    /**
     * TimeTrigger
     */
    public build(): TimeTrigger {
        return new TimeTrigger(
            this.getId(),
            this.hour,
            this.minute,
            this.objectId,
            this.valueCheck,
            this.getWeekdays(),
            this.getAction() as any as Action,
            this.todayTrigger,
        );
    }
}
