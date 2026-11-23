import type { Metar } from "./metar-parser.type.js";
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