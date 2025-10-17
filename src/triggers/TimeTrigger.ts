import type { Action } from "../actions/Action";
import { BaseDailyTrigger } from "./BaseDailyTrigger";
import type { Weekday } from "./Weekday";

/**
 * TimeTrigger
 */
export class TimeTrigger extends BaseDailyTrigger {
    private readonly hours: number;
    private readonly minutes: number;
    private readonly objectId: number;
    private readonly valueCheck: boolean;
    private readonly todayTrigger: any;

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
        todayTrigger: any,
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
    public getTodayTrigger(): any {
        return this.todayTrigger;
    }

    /**
     * @returns all data
     */
    public getData(): any {
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
