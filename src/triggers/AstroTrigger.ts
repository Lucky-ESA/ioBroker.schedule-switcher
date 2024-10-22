import { Action } from "../actions/Action";
import { AstroTime } from "./AstroTime";
import { BaseDailyTrigger } from "./BaseDailyTrigger";
import { Weekday } from "./Weekday";

export class AstroTrigger extends BaseDailyTrigger {
    public static readonly MAX_SHIFT = 120;

    private readonly astroTime: AstroTime;

    private readonly shiftInMinutes: number;
    private readonly objectId: number;

    constructor(
        id: string,
        astroTime: AstroTime,
        shiftInMinutes: number,
        weekdays: Weekday[],
        action: Action,
        objectId: number,
    ) {
        super(id, action, weekdays);
        if (astroTime == null) {
            throw new Error("Astro time may not be null.");
        }
        if (
            shiftInMinutes == null ||
            shiftInMinutes > AstroTrigger.MAX_SHIFT ||
            shiftInMinutes < -AstroTrigger.MAX_SHIFT
        ) {
            throw new Error("Shift in minutes must be in range -120 to 120.");
        }
        this.astroTime = astroTime;
        this.shiftInMinutes = shiftInMinutes;
        this.objectId = objectId;
    }

    public getAstroTime(): AstroTime {
        return this.astroTime;
    }

    public getData(): any {
        return {
            id: this.getId(),
            astroTime: this.getAstroTime(),
            shift: this.getShiftInMinutes(),
            objectId: this.getObjectId(),
            weekdays: [this.getWeekdays()],
            trigger: "AstroTrigger",
        };
    }

    public getObjectId(): number {
        return this.objectId;
    }

    public getShiftInMinutes(): number {
        return this.shiftInMinutes;
    }

    public toString(): string {
        return (
            `AstroTrigger {id=${this.getId()}, astroTime=${this.getAstroTime()},` +
            ` shift=${this.getShiftInMinutes()}, weekdays=[${this.getWeekdays()}]}`
        );
    }
}
