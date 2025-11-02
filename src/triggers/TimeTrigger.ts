import type { Action } from "../types/Action";
import type { AllTriggers, TodayTrigger } from "../types/AllTrigger";
import type { Weekday } from "../types/Weekday";
import { BaseDailyTrigger } from "./BaseDailyTrigger";

/**
 * TimeTrigger
 */
export class TimeTrigger extends BaseDailyTrigger {
    private readonly hours: number;
    private readonly minutes: number;
    private readonly objectId: number;
    private readonly valueCheck: boolean;
    private readonly todayTrigger: TodayTrigger;

    /**
     * @param id ID
     * @param hour Hour
     * @param minute Minutes
     * @param objectId Object ID
     * @param valueCheck check value true/false
     * @param weekdays Weekdays
     * @param action Action
     * @param todayTrigger Trigger
     */
    constructor(
        id: string,
        hour: number,
        minute: number,
        objectId: number,
        valueCheck: boolean,
        weekdays: Weekday[],
        action: Action,
        todayTrigger: TodayTrigger,
    ) {
        super(id, action, weekdays);
        this.hours = hour;
        this.minutes = minute;
        this.objectId = objectId;
        this.valueCheck = valueCheck;
        this.todayTrigger = todayTrigger;
    }

    /**
     * @returns this
     */
    public getHour(): number {
        return this.hours;
    }

    /**
     * @returns this
     */
    public getMinute(): number {
        return this.minutes;
    }

    /**
     * @returns this
     */
    public getObjectId(): number {
        return this.objectId;
    }

    /**
     * @returns this
     */
    public getValueCheck(): boolean {
        return this.valueCheck;
    }

    /**
     * @returns this
     */
    public getTodayTrigger(): TodayTrigger {
        return this.todayTrigger;
    }

    /**
     * @returns all data
     */
    public getData(): AllTriggers {
        return {
            id: this.getId(),
            hour: this.getHour(),
            minute: this.getMinute(),
            objectId: this.getObjectId(),
            valueCheck: this.getValueCheck(),
            weekdays: this.getWeekdays(),
            trigger: "TimeTrigger",
            todayTrigger: this.getTodayTrigger(),
        };
    }

    /**
     *@returns string
     */
    public toString(): string {
        return (
            `TimeTrigger {id=${this.getId()}, objectId=${this.getObjectId()}, todayTrigger=${JSON.stringify(this.getTodayTrigger())},` +
            ` valueCheck=${this.getValueCheck()}, hour=${this.getHour()}, minute=${this.getMinute()}, weekdays=[${this.getWeekdays()}]}`
        );
    }
}
