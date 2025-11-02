/**
 * LoggingService
 */
export interface LoggingService {
    /**
     * Info
     */
    logInfo(message: string): void;
    /**
     * Error
     */
    logError(message: string): void;
    /**
     * Debug
     */
    logDebug(message: string): void;
    /**
     * Silly
     */
    logSilly(message: string): void;
    /**
     * Warn
     */
    logWarn(message: string): void;
}
