import { Action } from "../actions/Action";
import { AstroTime } from "./AstroTime";
import { BaseDailyTrigger } from "./BaseDailyTrigger";
import { Weekday } from "./Weekday";

export class AstroTrigger extends BaseDailyTrigger {
    private readonly astroTime: AstroTime;
    private readonly shiftInMinutes: number;
    private readonly objectId: number;
    private readonly todayTrigger: any;

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

    public getAstroTime(): AstroTime {
        return this.astroTime;
    }

    public getData(): any {
        return {
            id: this.getId(),
            astroTime: this.getAstroTime(),
            shift: this.getShiftInMinutes(),
            todayTriger: this.getTodayTrigger(),
            objectId: this.getObjectId(),
            weekdays: [this.getWeekdays()],
            trigger: "AstroTrigger",
        };
    }

    public getObjectId(): number {
        return this.objectId;
    }

    public getTodayTrigger(): any {
        return this.todayTrigger;
    }

    public getShiftInMinutes(): number {
        return this.shiftInMinutes;
    }

    public toString(): string {
        return (
            `AstroTrigger {id=${this.getId()}, objectId=${this.getObjectId()}, todayTrigger=${JSON.stringify(this.getTodayTrigger())},` +
            ` astroTime=${this.getAstroTime()}, shift=${this.getShiftInMinutes()}, weekdays=[${this.getWeekdays()}]}`
        );
    }
}
