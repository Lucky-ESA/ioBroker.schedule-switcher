import type { Action } from "../actions/Action";
import type { AstroTime } from "./AstroTime";
import { BaseDailyTrigger } from "./BaseDailyTrigger";
import type { Weekday } from "./Weekday";

/**
 * BaseDailyTrigger
 */
export class AstroTrigger extends BaseDailyTrigger {
    private readonly astroTime: AstroTime;
    private readonly shiftInMinutes: number;
    private readonly objectId: number;
    private readonly todayTrigger: any;

    /**
     *
     * @param id ID
     * @param astroTime Astrotime
     * @param shiftInMinutes Shift
     * @param weekdays Weekdays
     * @param action Action
     * @param objectId ObjectId
     * @param todayTrigger Trigger
     */
    constructor(
        id: string,
        astroTime: AstroTime,
        shiftInMinutes: number,
        weekdays: Weekday[],
        action: Action,
        objectId: number,
        todayTrigger: any,
    ) {
        super(id, action, weekdays);
        this.astroTime = astroTime;
        this.shiftInMinutes = shiftInMinutes;
        this.objectId = objectId;
        this.todayTrigger = todayTrigger;
    }

    /**
     * getAstroTime
     */
    public getAstroTime(): AstroTime {
        return this.astroTime;
    }

    /**
     * getData
     */
    public getData(): any {
        return {
            id: this.getId(),
            astroTime: this.getAstroTime(),
            shift: this.getShiftInMinutes(),
            todayTriger: this.getTodayTrigger(),
            objectId: this.getObjectId(),
            weekdays: this.getWeekdays(),
            trigger: "AstroTrigger",
        };
    }

    /**
     * getObjectId
     */
    public getObjectId(): number {
        return this.objectId;
    }

    /**
     * getTodayTrigger
     */
    public getTodayTrigger(): any {
        return this.todayTrigger;
    }

    /**
     * getShiftInMinutes
     */
    public getShiftInMinutes(): number {
        return this.shiftInMinutes;
    }

    /**
     * toString
     */
    public toString(): string {
        return (
            `AstroTrigger {id=${this.getId()}, objectId=${this.getObjectId()}, todayTrigger=${JSON.stringify(this.getTodayTrigger())},` +
            ` astroTime=${this.getAstroTime()}, shift=${this.getShiftInMinutes()}, weekdays=[${this.getWeekdays()}]}`
        );
    }
}
