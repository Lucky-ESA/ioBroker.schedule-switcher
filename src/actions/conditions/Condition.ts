/**
 * Condition
 */
export interface Condition {
    /**
     * evaluate
     */
    evaluate(): Promise<boolean>;
}
