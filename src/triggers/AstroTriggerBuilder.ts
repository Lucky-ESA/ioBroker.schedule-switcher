import type { Action } from "../actions/Action";
import type { Builder } from "../Builder";
import type { AstroTime } from "./AstroTime";
import { AstroTrigger } from "./AstroTrigger";
import { DailyTriggerBuilder } from "./DailyTriggerBuilder";
import type { Weekday } from "./Weekday";

/**
 * DailyTriggerBuilder
 */
export class AstroTriggerBuilder extends DailyTriggerBuilder implements Builder<AstroTrigger> {
    private astroTime: AstroTime | null = null;
    private shift = 0;
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
     * @param shift shiftminutes
     */
    public setShift(shift: number): AstroTriggerBuilder {
        this.shift = shift;
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
    public setTodayTrigger(todayTrigger: any): AstroTriggerBuilder {
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
            this.astroTime as any as AstroTime,
            this.shift,
            this.getWeekdays(),
            this.getAction() as any as Action,
            this.objectId,
            this.valueCheck,
            this.todayTrigger,
        );
    }
}
