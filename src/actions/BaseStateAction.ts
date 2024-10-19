import { StateService } from "../services/StateService";
import { Action } from "./Action";

export abstract class BaseStateAction implements Action {
    private readonly stateService: StateService;

    protected constructor(stateService: StateService) {
        if (stateService == null) {
            throw new Error("StateService may not be null or undefined.");
        }
        this.stateService = stateService;
    }

    abstract execute(): void;

    protected getStateService(): StateService {
        return this.stateService;
    }
}
