import type { Action } from "../types/Action";
import type { Builder } from "../types/Builder";
import type { DailyTrigger } from "../types/DailyTrigger";
import type { Weekday } from "../types/Weekday";

/**
 * DailyTriggerBuilder
 */
export abstract class DailyTriggerBuilder implements Builder<DailyTrigger> {
    private action: Action | null = null;
    private id = "0";
    private weekdays: Weekday[] = [];

    /**
     * @param action Action
     * @returns this
     */
    public setAction(action: Action): DailyTriggerBuilder {
        this.action = action;
        return this;
    }

    /**
     * @param id ID
     * @returns this
     */
    public setId(id: string): DailyTriggerBuilder {
        this.id = id;
        return this;
    }

    /**
     * @param weekdays Weekdays
     * @returns this
     */
    public setWeekdays(weekdays: Weekday[]): DailyTriggerBuilder {
        this.weekdays = weekdays;
        return this;
    }

    /**
     * @returns this
     */
    protected getAction(): Action | null {
        return this.action;
    }

    /**
     * @returns this
     */
    protected getWeekdays(): Weekday[] {
        return this.weekdays;
    }

    /**
     * @returns this
     */
    protected getId(): string {
        return this.id;
    }

    public abstract build(): DailyTrigger;
}
