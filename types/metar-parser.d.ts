export interface MetarCode {
    code: string;
}
export interface MetarWind {
    degrees: number | null;
    speed_kts: number;
    speed_mps: number;
    gust_kts: number | null;
    gust_mps: number | null;
    degrees_from: number | null;
    degrees_to: number | null;
}
export interface MetarVisibility {
    miles: number;
    miles_text: string;
    meters: number;
    meters_text: string;
}
export type MetarCloudCode = "FEW" | "SCT" | "BKN" | "OVC";
export interface MetarCloud {
    code: MetarCloudCode;
    feet: number;
    meters: number;
}
export interface MetarCeiling {
    feet: number | null;
    meters: number | null;
}
export interface MetarTemperature {
    celsius: number | null;
    fahrenheit: number | null;
}
export interface MetarHumidity {
    percent: number | null;
}
export interface MetarPressure {
    hg: number | null;
    kpa: number | null;
    mb: number | null;
}
export type MetarIcaoFlightCategory = "VFR" | "IFR";
export type MetarFlightCategory = MetarIcaoFlightCategory | "MVFR" | "LIFR";
export interface Metar {
    raw_text: string;
    raw_parts: string[];
    icao: string;
    observed: Date;
    wind: MetarWind;
    visibility: MetarVisibility;
    conditions: MetarCode[];
    clouds: MetarCloud[];
    ceiling: MetarCeiling;
    temperature: MetarTemperature;
    dewpoint: MetarTemperature;
    humidity: MetarHumidity;
    barometer: MetarPressure;
    flight_category: MetarFlightCategory | null;
    icao_flight_category: MetarIcaoFlightCategory | null;
}
/**
 * Convert METAR string into structured object.
 * @see     https://api.checkwx.com/#31-single
 * @see     https://www.skybrary.aero/index.php/Meteorological_Terminal_Air_Report_(METAR)
 * @param   {String}  metarString raw
 * @returns {Metar} with structured information. The object resembles the API
 *                   reponse of the data property of https://www.checkwxapi.com/metar
 */
export declare const metarParser: (metarString: string) => Metar;
//# sourceMappingURL=metar-parser.d.ts.map