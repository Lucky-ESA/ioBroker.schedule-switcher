import type { Action } from "../types/Action";
import type { AllTriggers, TodayTrigger } from "../types/AllTrigger";
import type { AstroTime } from "../types/AstroTime";
import type { Weekday } from "../types/Weekday";
import { BaseDailyTrigger } from "./BaseDailyTrigger";

/**
 * BaseDailyTrigger
 */
export class AstroTrigger extends BaseDailyTrigger {
    private readonly astroTime: AstroTime;
    private readonly shiftInMinutes: number;
    private readonly objectId: number;
    private readonly valueCheck: boolean;
    private readonly todayTrigger: TodayTrigger;

    /**
     *
     * @param id ID
     * @param astroTime Astrotime
     * @param shiftInMinutes Shift
     * @param weekdays Weekdays
     * @param action Action
     * @param objectId ObjectId
     * @param valueCheck check value true/false
     * @param todayTrigger Trigger
     */
    constructor(
        id: string,
        astroTime: AstroTime,
        shiftInMinutes: number,
        weekdays: Weekday[],
        action: Action,
        objectId: number,
        valueCheck: boolean,
        todayTrigger: TodayTrigger,
    ) {
        super(id, action, weekdays);
        this.astroTime = astroTime;
        this.shiftInMinutes = shiftInMinutes;
        this.objectId = objectId;
        this.valueCheck = valueCheck;
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
    public getData(): AllTriggers {
        return {
            id: this.getId(),
            astroTime: this.getAstroTime(),
            shiftInMinutes: this.getShiftInMinutes(),
            todayTrigger: this.getTodayTrigger(),
            objectId: this.getObjectId(),
            valueCheck: this.getValueCheck(),
            weekdays: this.getWeekdays(),
            trigger: "AstroTrigger",
        };
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
     * @returns this
     */
    public getShiftInMinutes(): number {
        return this.shiftInMinutes;
    }

    /**
     * toString
     */
    public toString(): string {
        return (
            `AstroTrigger {id=${this.getId()}, objectId=${this.getObjectId()}, valueCheck=${this.getValueCheck()}, todayTrigger=${JSON.stringify(this.getTodayTrigger())},` +
            ` astroTime=${this.getAstroTime()}, shiftInMinutes=${this.getShiftInMinutes()}, weekdays=[${this.getWeekdays()}]}`
        );
    }
}
