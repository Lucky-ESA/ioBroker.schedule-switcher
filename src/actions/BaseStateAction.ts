import type { StateService } from "../services/StateService";
import type { Action } from "./Action";

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
    abstract execute(trigger: any): void;
    protected getStateService(): StateService {
        return this.stateService;
    }
}
