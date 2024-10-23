import { Action } from "../actions/Action";
import { Builder } from "../Builder";
import { DailyTriggerBuilder } from "./DailyTriggerBuilder";
import { TimeTrigger } from "./TimeTrigger";
import { Weekday } from "./Weekday";

export class TimeTriggerBuilder extends DailyTriggerBuilder implements Builder<TimeTrigger> {
    private hour = 0;
    private minute = 0;
    private objectId = 0;
    private nextTrigger = {};

    public setHour(hour: number): TimeTriggerBuilder {
        this.hour = hour;
        return this;
    }

    public setMinute(minute: number): TimeTriggerBuilder {
        this.minute = minute;
        return this;
    }

    public setObjectId(objectId: number): TimeTriggerBuilder {
        this.objectId = objectId;
        return this;
    }

    public setNextTrigger(nextTrigger: any): TimeTriggerBuilder {
        this.nextTrigger = nextTrigger;
        return this;
    }

    public setAction(action: Action): TimeTriggerBuilder {
        super.setAction(action);
        return this;
    }

    public setId(id: string): TimeTriggerBuilder {
        super.setId(id);
        return this;
    }

    public setWeekdays(weekdays: Weekday[]): TimeTriggerBuilder {
        super.setWeekdays(weekdays);
        return this;
    }

    public build(): TimeTrigger {
        return new TimeTrigger(
            this.getId(),
            this.hour,
            this.minute,
            this.objectId,
            this.getWeekdays(),
            this.getAction() as any as Action,
            this.nextTrigger,
        );
    }
}
