import type { StateService } from "../../services/StateService";
import type { Condition } from "./Condition";
import { EqualitySign } from "./EqualitySign";

/**
 * StringStateAndStateCondition
 */
export class StringStateAndStateCondition implements Condition {
    private readonly stateId1: string;
    private readonly stateId2: string;
    private readonly stateService: StateService;
    private readonly sign: EqualitySign;

    /**
     * @param stateId1 ID 1
     * @param stateId2 ID 2
     * @param sign Sign
     * @param stateService setState
     */
    constructor(stateId1: string, stateId2: string, sign: EqualitySign, stateService: StateService) {
        if (stateId1 == null || stateId1.length === 0) {
            throw new Error("First state id may not be null, undefined or empty.");
        }
        if (stateId2 == null || stateId2.length === 0) {
            throw new Error("Second state id may not be null, undefined or empty.");
        }
        if (sign == null) {
            throw new Error("Sign may not be null or undefined.");
        }
        if (stateService == null) {
            throw new Error("State service may not be null or undefined.");
        }
        this.stateId1 = stateId1;
        this.stateId2 = stateId2;
        this.sign = sign;
        this.stateService = stateService;
    }

    /**
     * evaluate
     */
    public async evaluate(): Promise<boolean> {
        const firstStateValue = String(await this.stateService.getForeignState(this.stateId1));
        const secondStateValue = String(await this.stateService.getForeignState(this.stateId2));
        let result: boolean;
        if (this.sign == EqualitySign.NotEqual) {
            result = firstStateValue !== secondStateValue;
        } else {
            result = firstStateValue === secondStateValue;
        }
        return Promise.resolve(result);
    }

    /**
     * getStateId1
     */
    public getStateId1(): string {
        return this.stateId1;
    }

    /**
     * getStateId2
     */
    public getStateId2(): string {
        return this.stateId2;
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
        return `${this.stateId1} ${this.sign} ${this.stateId2}`;
    }
}
