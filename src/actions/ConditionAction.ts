import { Action } from "./Action";
import { Condition } from "./conditions/Condition";

export class ConditionAction implements Action {
    private readonly condition: Condition;
    private action: Action;

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

    public getAction(): Action {
        return this.action;
    }

    public setAction(action: Action): void {
        if (action == null) {
            this.adapter.log.error("action may not be null or undefined");
            return;
        }
        this.action = action;
    }

    public getCondition(): Condition {
        return this.condition;
    }

    public execute(): void {
        this.condition
            .evaluate()
            .then((result) => {
                if (result) {
                    this.adapter.log.debug(`Executing action because condition ${this.condition} evaluated to true`);
                    this.action.execute();
                } else {
                    this.adapter.log.debug(
                        `Not executing action because condition ${this.condition} evaluated to false`,
                    );
                }
            })
            .catch((e) => {
                this.adapter.log.error(`Error while evaluating condition: ${this.condition} - ${e}`);
            });
    }
}
