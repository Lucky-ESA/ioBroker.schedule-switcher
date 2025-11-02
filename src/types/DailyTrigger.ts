import type { Trigger } from ".//Trigger";
import type { Weekday } from "./Weekday";

/**
 * Trigger
 */
export interface DailyTrigger extends Trigger {
    /**
     * Weekdays
     */
    getWeekdays(): Weekday[];
}
