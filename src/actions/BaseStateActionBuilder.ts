import type { Builder } from "../types/Builder";
import type { StateService } from "../types/StateService";
import type { BaseStateAction } from "./BaseStateAction";

/**
 * BaseStateActionBuilder
 */
export abstract class BaseStateActionBuilder implements Builder<BaseStateAction> {
    protected stateService: StateService | null = null;

    /**
     * @param stateService setState
     * @returns this
     */
    public setStateService(stateService: StateService): BaseStateActionBuilder {
        this.stateService = stateService;
        return this;
    }

    public abstract build(): BaseStateAction;
}
