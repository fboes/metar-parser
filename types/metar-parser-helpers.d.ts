import type { MetarVisibility, MetarCloudCode, MetarCloud, MetarTemperature, MetarCeiling, MetarFlightCategory, MetarIcaoFlightCategory } from "./metar-parser.type.js";
/**
 * @param {Number} value dito
 * @param {Number} toNext round to next full xxxx
 * @returns {Number} rounded value
 */
export declare function round(value: number, toNext?: number): number;
export declare function getVisibility(visibility_miles: number, visibility_meters: number): MetarVisibility;
export declare function getCloud(code: MetarCloudCode, hundredFeet: string): MetarCloud;
export declare function getTemperature(temperatureString: string): MetarTemperature;
/**
 * @see http://andrew.rsmas.miami.edu/bmcnoldy/Humidity.html
 */
export declare function getHumidity(temp: MetarTemperature, dew: MetarTemperature): number | null;
export declare function getFlightCategory(visibility: MetarVisibility, ceiling: MetarCeiling): MetarFlightCategory;
export declare function getIcaoFlightCategory(visibility: MetarVisibility, ceiling: MetarCeiling): MetarIcaoFlightCategory;
export declare function getCeiling(clouds: MetarCloud[]): MetarCloud | undefined;
export declare function metarSplit(metarString: string): string[];
//# sourceMappingURL=metar-parser-helpers.d.ts.map