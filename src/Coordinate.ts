import type { CoordinateTypes } from "./CoordinateTypes";
import type { LoggingService } from "./services/LoggingService";

/**
 * @param latitude number
 * @param longitude number
 */
export class Coordinate implements CoordinateTypes {
    private readonly latitude: number;
    private readonly longitude: number;

    /**
     * @param latitude number
     * @param longitude number
     * @param logger ioBroker.Adapter
     */
    constructor(latitude: number, longitude: number, logger: LoggingService) {
        if (Math.abs(latitude) > 90) {
            logger.logError("Latitude must be < 90 and > -90 - use 90");
            this.latitude = 90;
        } else {
            this.latitude = latitude;
        }
        if (Math.abs(longitude) > 180) {
            logger.logError("Longitude must be < 180 and > -180 - use 180");
            this.longitude = 180;
        } else {
            this.longitude = longitude;
        }
    }

    /**
     * @returns latitude
     */
    public getLatitude(): number {
        return this.latitude;
    }

    /**
     * @returns longitude
     */
    public getLongitude(): number {
        return this.longitude;
    }
}
