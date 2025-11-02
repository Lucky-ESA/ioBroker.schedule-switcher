import type { LoggingService } from "../types/LoggingService";

/**
 * IoBrokerLoggingService
 */
export class IoBrokerLoggingService implements LoggingService {
    /**
     * @param adapter ioBroker
     */
    constructor(private adapter: ioBroker.Adapter) {}

    /**
     * @param message Text
     */
    public logDebug(message: string): void {
        this.adapter.log.debug(message);
    }

    /**
     * @param message Text
     */
    public logError(message: string): void {
        this.adapter.log.error(message);
    }

    /**
     * @param message Text
     */
    public logInfo(message: string): void {
        this.adapter.log.info(message);
    }

    /**
     * @param message Text
     */
    public logSilly(message: string): void {
        this.adapter.log.silly(message);
    }

    /**
     * @param message Text
     */
    public logWarn(message: string): void {
        this.adapter.log.warn(message);
    }
}
