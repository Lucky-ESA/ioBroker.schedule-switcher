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
     * @param adapter ioBroker
     */
    constructor(
        condition: Condition,
        action: Action,
        private adapter: ioBroker.Adapter,
    ) {
        if (condition == null) {
            this.adapter.log.error("condition may not be null or undefined");
        }
        if (action == null) {
            this.adapter.log.error("action may not be null or undefined");
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
            this.adapter.log.error("action may not be null or undefined");
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
     */
    public execute(): void {
        this.condition
            .evaluate()
            .then(result => {
                if (result) {
                    this.adapter.log.debug(`Executing action because condition ${this.condition} evaluated to true`);
                    this.action.execute(false);
                } else {
                    this.adapter.log.debug(
                        `Not executing action because condition ${this.condition} evaluated to false`,
                    );
                }
            })
            .catch(e => {
                this.adapter.log.error(`Error while evaluating condition: ${this.condition} - ${e}`);
            });
    }
}
