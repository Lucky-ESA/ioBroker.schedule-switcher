/**
 * ValidationView
 */
export interface ValidationView {
    /**
     * view
     */
    validationView(utils: string): Promise<void>;
}
