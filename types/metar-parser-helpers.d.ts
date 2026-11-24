import type { MetarVisibility, MetarCloudCode, MetarCloud, MetarTemperature, MetarCeiling, MetarFlightCategory as MetarUsFlightCategory, MetarIcaoFlightCategory, MetarHumidity } from "./metar-parser.type.js";
/**
 * @param {Number} value dito
 * @param {Number} toNext round to next full xxxx
 * @returns {Number} rounded value
 */
export declare function round(value: number, toNext?: number): number;
export declare function metarVisibility(visibility_miles: number, visibility_meters: number): MetarVisibility;
export declare function metarCloud(code: MetarCloudCode, hundredFeet: string): MetarCloud;
export declare function metarTemperature(temperatureString: string): MetarTemperature | null;
/**
 * @see http://andrew.rsmas.miami.edu/bmcnoldy/Humidity.html
 */
export declare function relativeHumidity(temp: MetarTemperature | null, dew: MetarTemperature | null): MetarHumidity | null;
export declare function flightCategoryUs(visibility: MetarVisibility | null, ceiling: MetarCeiling | null): MetarUsFlightCategory | null;
export declare function flightCategoryIcao(visibility: MetarVisibility | null, ceiling: MetarCeiling | null): MetarIcaoFlightCategory | null;
/**
 * @see findCeiling
 * @returns the ceiling by looking for the lowest cloud layer reporting `BKN`
 *  or `OVC`.
 */
export declare function metarCeiling(clouds: MetarCloud[]): MetarCeiling | null;
/**
 * @return METAR string split along its white spaces. Will convert fractional
 *   visibility values into one concatenated value.
 */
export declare function metarSplit(metarString: string): string[];
export declare function date(date: number, hours: number, minutes: number): Date;
//# sourceMappingURL=metar-parser-helpers.d.ts.map