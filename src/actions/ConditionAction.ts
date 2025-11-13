import type { LoggingService } from "../types//LoggingService";
import type { Action } from "../types/Action";
import type { AllTriggers } from "../types/AllTrigger";
import type { Condition } from "../types/Condition";

/**
 * ConditionAction
 */
export class ConditionAction implements Action {
    private readonly condition: Condition;
    private action: Action;

    /**
     * @param condition Condition
     * @param action Action
     * @param logger Logs
     */
    constructor(
        condition: Condition,
        action: Action,
        private logger: LoggingService,
    ) {
        this.logger = logger;
        if (condition == null) {
            this.logger.logError("condition may not be null or undefined");
        }
        if (action == null) {
            this.logger.logError("action may not be null or undefined");
        }
        this.condition = condition;
        this.action = action;
    }

    /**
     * getAction
     *
     * @returns action
     */
    public getAction(): Action {
        return this.action;
    }

    /**
     * @param action Action
     */
    public setAction(action: Action): void {
        if (action == null) {
            this.logger.logError("action may not be null or undefined");
            return;
        }
        this.action = action;
    }

    /**
     * getCondition
     *
     * @returns condition
     */
    public getCondition(): Condition {
        return this.condition;
    }

    /**
     * execute
     *
     * @param trigger trigger
     */
    public execute(trigger: AllTriggers): void {
        this.condition
            .evaluate()
            .then(result => {
                if (result) {
                    this.logger.logDebug(`Executing action because condition ${this.condition} evaluated to true`);
                    this.action.execute(trigger);
                } else {
                    this.logger.logDebug(`Not executing action because condition ${this.condition} evaluated to false`);
                }
            })
            .catch(e => {
                this.logger.logError(`Error while evaluating condition: ${this.condition} - ${e}`);
            });
    }
}
