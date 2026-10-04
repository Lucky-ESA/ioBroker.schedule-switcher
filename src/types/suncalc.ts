/**
 * GetTimesResult
 */
export interface GetTimesResult {
    /**
     * @param {Date|null} dawn
     */
    dawn: Date | null;
    /**
     * @param {Date|null} dusk
     */
    dusk: Date | null;
    /**
     * @param {Date|null} goldenHour
     */
    goldenHour: Date | null;
    /**
     * @param {Date|null} goldenHourEnd
     */
    goldenHourEnd: Date | null;
    /**
     * @param {Date|null} nadir
     */
    nadir: Date | null;
    /**
     * @param {Date|null} nauticalDawn
     */
    nauticalDawn: Date | null;
    /**
     * @param {Date|null} nauticalDusk
     */
    nauticalDusk: Date | null;
    /**
     * @param {Date|null} night
     */
    night: Date | null;
    /**
     * @param {Date|null} nightEnd
     */
    nightEnd: Date | null;
    /**
     * @param {Date|null} solarNoon
     */
    solarNoon: Date | null;
    /**
     * @param {Date|null} sunrise
     */
    sunrise: Date | null;
    /**
     * @param {Date|null} sunriseEnd
     */
    sunriseEnd: Date | null;
    /**
     * @param {Date|null} sunset
     */
    sunset: Date | null;
    /**
     * @param {Date|null} sunsetStart
     */
    sunsetStart: Date | null;
}
