import type { Action } from "../types/Action";
import type { Destroyable } from "../types/Destroyable";
import type { Trigger } from "../types/Trigger";

/**
 * OneTimeTrigger
 */
export class OneTimeTrigger implements Trigger, Destroyable {
    private readonly id: string;
    private readonly objectId: number;
    private readonly valueCheck: boolean;
    private readonly timedate: boolean;
    private action: Action;
    private readonly date: Date;
    private readonly onDestroy: (() => void) | null;

    /**
     * @param id ID
     * @param objectId Object ID
     * @param valueCheck check value true/false
     * @param timedate Date
     * @param action Action
     * @param date Date
     * @param onDestroy Destroy
     */
    constructor(
        id: string,
        objectId: number,
        valueCheck: boolean,
        timedate: boolean,
        action: Action,
        date: Date,
        onDestroy: (() => void) | null,
    ) {
        if (id == null) {
            throw new Error("Id may not be null or undefined.");
        }
        if (action == null) {
            throw new Error("Action may not be null or undefined.");
        }
        if (date == null) {
            throw new Error("Date may not be null or undefined.");
        }
        this.id = id;
        this.objectId = objectId;
        this.valueCheck = valueCheck;
        this.timedate = timedate;
        this.action = action;
        this.date = new Date(date);
        this.onDestroy = onDestroy;
    }

    /**
     * getAction
     */
    public getAction(): Action {
        return {
            execute: (trigger: any) => {
                this.action.execute(trigger);
                this.destroy();
            },
        } as Action;
    }

    /**
     * @param action Action
     */
    public setAction(action: Action): void {
        if (action == null) {
            throw new Error("Action may not be null or undefined.");
        }
        this.action = action;
    }

    /**
     * @returns ID
     */
    public getId(): string {
        return this.id;
    }

    /**
     * @returns date
     */
    public getDate(): Date {
        return new Date(this.date);
    }

    /**
     * @returns objectid
     */
    public getObjectId(): number {
        return this.objectId;
    }

    /**
     * @returns valueCheck
     */
    public getValueCheck(): boolean {
        return this.valueCheck;
    }

    /**
     * @returns time
     */
    public getTimeDate(): boolean {
        return this.timedate;
    }

    /**
     * getData
     */
    public getData(): any {
        return {
            id: this.getId(),
            objectId: this.getObjectId(),
            valueCheck: this.getValueCheck(),
            timedate: this.getTimeDate(),
            date: this.getDate().toISOString(),
            trigger: "OneTimeTrigger",
        };
    }

    /**
     * @returns string
     */
    public toString(): string {
        return (
            `OneTimeTrigger {id=${this.getId()}, date=${this.getDate().toISOString()}, timedate=${this.getTimeDate()}, ` +
            `valueCheck=${this.getValueCheck()}, objectId=${this.getObjectId()}}`
        );
    }

    /**
     * @returns action
     */
    public getInternalAction(): Action {
        return this.action;
    }

    /**
     * Destroy all
     */
    public destroy(): void {
        if (this.onDestroy) {
            this.onDestroy();
        }
    }
}
