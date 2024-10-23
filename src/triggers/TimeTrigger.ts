import { Action } from "../actions/Action";
import { BaseDailyTrigger } from "./BaseDailyTrigger";
import { Weekday } from "./Weekday";

export class TimeTrigger extends BaseDailyTrigger {
    private readonly hours: number;
    private readonly minutes: number;
    private readonly objectId: number;
    private readonly nextTrigger: any;

    constructor(
        id: string,
        hour: number,
        minute: number,
        objectId: number,
        weekdays: Weekday[],
        action: Action,
        nextTrigger: any,
    ) {
        super(id, action, weekdays);
        if (hour == undefined || hour < 0 || hour > 23) {
            throw new Error("Hour must be in range 0-23.");
        }
        if (minute == undefined || minute < 0 || minute > 59) {
            throw new Error("Minute must be in range 0-59.");
        }
        this.hours = hour;
        this.minutes = minute;
        this.objectId = objectId;
        this.nextTrigger = nextTrigger;
    }

    public getHour(): number {
        return this.hours;
    }

    public getMinute(): number {
        return this.minutes;
    }

    public getObjectId(): number {
        return this.objectId;
    }

    public getNextTrigger(): any {
        return this.nextTrigger;
    }

    public getData(): any {
        return {
            id: this.getId(),
            hour: this.getHour(),
            minute: this.getMinute(),
            objectId: this.getObjectId(),
            weekdays: [this.getWeekdays()],
            trigger: "TimeTrigger",
            nextTrigger: this.getNextTrigger(),
        };
    }

    public toString(): string {
        return (
            `TimeTrigger {id=${this.getId()}, nextEvent=${this.getNextTrigger()}, hour=${this.getHour()},` +
            ` minute=${this.getMinute()}, weekdays=[${this.getWeekdays()}]}`
        );
    }
}
