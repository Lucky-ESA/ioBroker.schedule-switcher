import type { StateService } from "../../services/StateService";
import type { Condition } from "./Condition";
import { EqualitySign } from "./EqualitySign";

/**
 * StringStateAndConstantCondition
 */
export class StringStateAndConstantCondition implements Condition {
    private readonly constant: string;
    private readonly stateId: string;
    private readonly stateService: StateService;
    private readonly sign: EqualitySign;

    /**
     * @param constant Constant
     * @param stateId ID
     * @param sign Sign
     * @param stateService setState
     */
    constructor(constant: string, stateId: string, sign: EqualitySign, stateService: StateService) {
        if (constant == null) {
            throw new Error("Constant value may not be null or undefined.");
        }
        if (stateId == null || stateId.length === 0) {
            throw new Error("State id may not be null, undefined or empty.");
        }
        if (sign == null) {
            throw new Error("Sign may not be null or undefined.");
        }
        if (stateService == null) {
            throw new Error("State service may not be null or undefined.");
        }
        this.constant = constant;
        this.stateId = stateId;
        this.sign = sign;
        this.stateService = stateService;
    }

    /**
     * evaluate
     */
    public async evaluate(): Promise<boolean> {
        const stateValue = String(await this.stateService.getForeignState(this.stateId));
        let result: boolean;
        if (this.sign == EqualitySign.NotEqual) {
            result = stateValue !== this.constant;
        } else {
            result = stateValue === this.constant;
        }
        return Promise.resolve(result);
    }

    /**
     * getConstant
     */
    public getConstant(): string {
        return this.constant;
    }

    /**
     * getStateId
     */
    public getStateId(): string {
        return this.stateId;
    }

    /**
     * getSign
     */
    public getSign(): EqualitySign {
        return this.sign;
    }

    /**
     * toString
     */
    public toString(): string {
        return `${this.constant} ${this.sign} ${this.stateId}`;
    }
}
