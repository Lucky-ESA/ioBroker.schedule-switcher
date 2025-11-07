import type { AstroTime } from "../types/AstroTime";
import type { Weekday } from "./Weekday";
/**
 * AllTriggers
 */
export interface AllTriggers {
    /**
     * @param {number|string} id
     */
    id: number | string;
    /**
     * @param {number} objectId
     */
    objectId: number;
    /**
     * @param {boolean} valueCheck
     */
    valueCheck: boolean;
    /**
     * @param {TodayTrigger} todayTrigger
     */
    todayTrigger: TodayTrigger;
    /**
     * A@param {AstroTime} astroTime
     */
    astroTime?: AstroTime;
    /**
     * @param {number} shift
     */
    shiftInMinutes?: number;
    /**
     * @param {Weekday[]} weekdays
     */
    weekdays: Weekday[];
    /**
     * @param {Date} date
     */
    date?: Date | string | number;
    /**
     * @param {boolean} timedate
     */
    timedate?: boolean;
    /**
     * @param {number} hour
     */
    hour?: number;
    /**
     * @param {number} minute
     */
    minute?: number;
    /**
     * @param {string} minute
     */
    trigger?: string;
}
/**
 * TodayTrigger
 */
export interface TodayTrigger {
    /**
     * @param {number} hour
     */
    hour?: number;
    /**
     * @param {number} minute
     */
    minute?: number;
    /**
     * @param {number} weekday
     */
    weekday?: number;
    /**
     * @param {Date} date
     */
    date?: Date;
}
