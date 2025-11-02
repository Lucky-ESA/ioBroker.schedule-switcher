import type { Action } from "../types/Action";
import type { AllTriggers } from "../types/AllTrigger";
import type { StateService } from "../types/StateService";

/**
 * BaseStateAction
 */
export abstract class BaseStateAction implements Action {
    private readonly stateService: StateService;
    protected constructor(stateService: StateService) {
        if (stateService == null) {
            throw new Error("StateService may not be null or undefined.");
        }
        this.stateService = stateService;
    }
    abstract execute(trigger: AllTriggers): void;
    protected getStateService(): StateService {
        return this.stateService;
    }
}
