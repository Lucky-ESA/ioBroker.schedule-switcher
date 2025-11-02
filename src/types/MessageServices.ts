/**
 * MessageServices
 */
export interface MessageServices {
    /**
     * handleMessage
     */
    handleMessage(message: ioBroker.Message): Promise<void>;
    /**
     * setCountTrigger
     */
    setCountTrigger(): Promise<void>;
    /**
     * setForeinState
     */
    destroy(): Promise<boolean>;
}
