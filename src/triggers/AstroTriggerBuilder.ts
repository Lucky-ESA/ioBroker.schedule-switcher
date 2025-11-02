import type { Action } from "../types/Action";
import type { TodayTrigger } from "../types/AllTrigger";
import type { AstroTime } from "../types/AstroTime";
import type { Builder } from "../types/Builder";
import type { Weekday } from "../types/Weekday";
import { AstroTrigger } from "./AstroTrigger";
import { DailyTriggerBuilder } from "./DailyTriggerBuilder";

/**
 * DailyTriggerBuilder
 */
export class AstroTriggerBuilder extends DailyTriggerBuilder implements Builder<AstroTrigger> {
    private astroTime: AstroTime | null = null;
    private shiftInMinutes = 0;
    private objectId = 0;
    private valueCheck = false;
    private todayTrigger = {};

    /**
     * @param astroTime AstroTime
     */
    public setAstroTime(astroTime: AstroTime): AstroTriggerBuilder {
        this.astroTime = astroTime;
        return this;
    }

    /**
     * @param shiftInMinutes shiftminutes
     */
    public setShift(shiftInMinutes: number): AstroTriggerBuilder {
        this.shiftInMinutes = shiftInMinutes;
        return this;
    }

    /**
     * @param objectId Object ID
     * @returns this
     */
    public setObjectId(objectId: number): AstroTriggerBuilder {
        this.objectId = objectId;
        return this;
    }

    /**
     * @param valueCheck check value true/false
     * @returns this
     */
    public setValueCheck(valueCheck: boolean): AstroTriggerBuilder {
        this.valueCheck = valueCheck;
        return this;
    }

    /**
     * @param todayTrigger trigger
     * @returns this
     */
    public setTodayTrigger(todayTrigger: TodayTrigger): AstroTriggerBuilder {
        this.todayTrigger = todayTrigger;
        return this;
    }

    /**
     * @param action Action
     * @returns this
     */
    public setAction(action: Action): AstroTriggerBuilder {
        super.setAction(action);
        return this;
    }

    /**
     * @param id Trigger ID
     * @returns this
     */
    public setId(id: string): AstroTriggerBuilder {
        super.setId(id);
        return this;
    }

    /**
     * @param weekdays Weekdays
     * @returns this
     */
    public setWeekdays(weekdays: Weekday[]): AstroTriggerBuilder {
        super.setWeekdays(weekdays);
        return this;
    }

    /**
     * @returns build
     */
    public build(): AstroTrigger {
        return new AstroTrigger(
            this.getId(),
            this.astroTime as AstroTime,
            this.shiftInMinutes,
            this.getWeekdays(),
            this.getAction() as Action,
            this.objectId,
            this.valueCheck,
            this.todayTrigger,
        );
    }
}
