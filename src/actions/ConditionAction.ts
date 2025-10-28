import type { LoggingService } from "../services/LoggingService";
import type { Action } from "./Action";
import type { Condition } from "./conditions/Condition";

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
     */
    public getCondition(): Condition {
        return this.condition;
    }

    /**
     * execute
     *
     * @param trigger trigger
     */
    public execute(trigger: any): void {
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
