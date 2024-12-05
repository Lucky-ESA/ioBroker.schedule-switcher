import type { Builder } from "../Builder";
import type { StateService } from "../services/StateService";
import type { BaseStateAction } from "./BaseStateAction";

/**
 * BaseStateActionBuilder
 */
export abstract class BaseStateActionBuilder implements Builder<BaseStateAction> {
    protected stateService: StateService | null = null;

    /**
     * @param stateService setState
     */
    public setStateService(stateService: StateService): BaseStateActionBuilder {
        this.stateService = stateService;
        return this;
    }

    public abstract build(): BaseStateAction;
}
