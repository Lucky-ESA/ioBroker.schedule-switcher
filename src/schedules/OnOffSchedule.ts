import { ConditionAction } from "../actions/ConditionAction";
import { OnOffStateAction } from "../actions/OnOffStateAction";
import type { UniversalTriggerScheduler } from "../scheduler/UniversalTriggerScheduler";
import type { LoggingService } from "../types/LoggingService";
import { Schedule } from "./Schedule";

/**
 * OnOffSchedule
 */
export class OnOffSchedule extends Schedule {
    private onAction: OnOffStateAction<string | boolean | number>;
    private offAction: OnOffStateAction<string | boolean | number>;

    /**
     * @param onAction on
     * @param offAction off
     * @param triggerScheduler Scheduler
     * @param loggingService Log service
     */
    constructor(
        onAction: OnOffStateAction<string | boolean | number>,
        offAction: OnOffStateAction<string | boolean | number>,
        triggerScheduler: UniversalTriggerScheduler,
        loggingService: LoggingService,
    ) {
        super(triggerScheduler, loggingService);
        if (onAction == null) {
            throw new Error(`onAction may not be null or undefined`);
        }
        if (offAction == null) {
            throw new Error(`offAction may not be null or undefined`);
        }
        this.onAction = onAction;
        this.offAction = offAction;
    }

    /**
     * @param onAction Action
     */
    public setOnAction(onAction: OnOffStateAction<string | boolean | number>): void {
        if (onAction == null) {
            throw new Error(`onAction may not be null or undefined`);
        }
        this.onAction = onAction;
        this.getTriggers().forEach(t => {
            const action = t.getAction();
            if (action instanceof OnOffStateAction) {
                if (action.getBooleanValue()) {
                    t.setAction(onAction);
                }
            } else if (action instanceof ConditionAction) {
                const decoratedAction = action.getAction();
                if (decoratedAction instanceof OnOffStateAction) {
                    if (decoratedAction.getBooleanValue()) {
                        action.setAction(onAction);
                    }
                }
            }
        });
    }

    /**
     * @param offAction Action
     */
    public setOffAction(offAction: OnOffStateAction<string | boolean | number>): void {
        if (offAction == null) {
            throw new Error(`offAction may not be null or undefined`);
        }
        this.offAction = offAction;
        this.getTriggers().forEach(t => {
            const action = t.getAction();
            if (action instanceof OnOffStateAction) {
                if (!action.getBooleanValue()) {
                    t.setAction(offAction);
                }
            } else if (action instanceof ConditionAction) {
                const decoratedAction = action.getAction();
                if (decoratedAction instanceof OnOffStateAction) {
                    if (!decoratedAction.getBooleanValue()) {
                        action.setAction(offAction);
                    }
                }
            }
        });
    }

    /**
     * getOnAction
     *
     * @returns action on
     */
    public getOnAction(): OnOffStateAction<string | boolean | number> {
        return this.onAction;
    }

    /**
     * getOffAction
     *
     * @returns action off
     */
    public getOffAction(): OnOffStateAction<string | boolean | number> {
        return this.offAction;
    }
}
