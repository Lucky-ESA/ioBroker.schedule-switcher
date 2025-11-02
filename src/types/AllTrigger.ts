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
     * @param {TodayTrigger | null | undefined} todayTrigger
     */
    todayTrigger: TodayTrigger;
    /**
     * A@param {AstroTime | null | undefined} astroTime
     */
    astroTime?: AstroTime | null | undefined;
    /**
     * @param {number | null | undefined} shift
     */
    shiftInMinutes?: number;
    /**
     * @param {Weekday[]} weekdays
     */
    weekdays: Weekday[];
    /**
     * @param {Date} date
     */
    date?: Date | null | undefined;
    /**
     * @param {boolean} timedate
     */
    timedate?: boolean | null | undefined;
    /**
     * @param {number | null | undefined} hour
     */
    hour?: number | null | undefined;
    /**
     * @param {number | null | undefined} minute
     */
    minute?: number | null | undefined;
    /**
     * @param {string | null | undefined} minute
     */
    trigger?: string | null | undefined;
}
/**
 * TodayTrigger
 */
export interface TodayTrigger {
    /**
     * @param {number | null | undefined} hour
     */
    hour?: number;
    /**
     * @param {number | null | undefined} minute
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
