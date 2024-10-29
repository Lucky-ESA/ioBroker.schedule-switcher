import { Action } from "../actions/Action";
import { Builder } from "../Builder";
import { OneTimeTrigger } from "./OneTimeTrigger";

export class OneTimeTriggerBuilder implements Builder<OneTimeTrigger> {
    private action: Action | null = null;
    private id = "0";
    private objectId = 0;
    private timedate = false;
    private date: Date | null = null;
    private onDestroy: (() => void) | null = null;

    public setAction(action: Action): OneTimeTriggerBuilder {
        this.action = action;
        return this;
    }

    public setId(id: string): OneTimeTriggerBuilder {
        this.id = id;
        return this;
    }

    public setDate(date: Date): OneTimeTriggerBuilder {
        this.date = date;
        return this;
    }

    public setObjectId(objectId: number): OneTimeTriggerBuilder {
        this.objectId = objectId;
        return this;
    }

    public setTimeDate(timedate: boolean): OneTimeTriggerBuilder {
        this.timedate = timedate;
        return this;
    }

    public setOnDestroy(onDestroy: () => void): OneTimeTriggerBuilder {
        this.onDestroy = onDestroy;
        return this;
    }

    public build(): OneTimeTrigger {
        return new OneTimeTrigger(
            this.id,
            this.objectId as number,
            this.timedate as boolean,
            this.action as any,
            this.date as any,
            this.onDestroy,
        );
    }
}
