import * as convert from "./convert.js";
import * as MetarParserHelpers from "./metar-parser-helpers.js";
import type { MetarCloudCode, Metar } from "./metar-parser.type.js";

/**
 * - 0: Initial state, search for ICAO code
 * - 1: Search for observed date
 * - 2: Search for wind
 * - 3: Searchh for visibility
 * - 4: Search for conditions
 * - 5: Search for clouds
 * - 6: Search for temperature
 * - 7: Search for pressure
 * - 8: Done
 */
type ParserMode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Convert METAR string into structured object.
 * @see     https://api.checkwx.com/#31-single
 * @see     https://www.skybrary.aero/index.php/Meteorological_Terminal_Air_Report_(METAR)
 * @param   {String}  metarString raw
 * @returns {Metar} with structured information. The object resembles the API
 *                   reponse of the data property of https://www.checkwxapi.com/metar
 */
export const metarParser = (metarString: string): Metar => {
  const metarObject = initializeMetarObject(metarString);

  let mode: ParserMode = 0;
  metarObject.raw_parts.forEach((metarPart) => {
    if (mode === 0 && metarPart.match(/^(METAR|TAF)$/)) {
      metarObject.type = metarPart as "TAF" | "METAR";
      return;
    }
    if (metarObject.type === "METAR" && mode > 1 && mode < 3 && metarPart.match(/^(\d+|\/{2,4})(?:\/(\d+))?(SM)?$/)) {
      mode = 3; // no wind reported
    }
    if (mode > 2 && mode < 5 && metarPart.match(/^(FEW|SCT|BKN|OVC|VV)(\d+)?/)) {
      mode = 5; // no visibility / conditions reported
    }
    if (mode > 3 && mode < 6 && metarPart.match(/^(M?\d+|\/\/)\/(M?\d+|\/\/)?$/)) {
      mode = 6; // end of clouds
    }
    if (metarPart.match(/^(TEMPO|FM\d+|\\n)$/)) {
      mode = 8;
    }

    switch (mode) {
      case 0:
        metarObject.icao = metarPart;
        mode = 1;
        break;
      case 1:
        mode = parseObservedDate(metarPart, metarObject, mode);
        break;
      case 2:
        mode = parseWind(metarPart, metarObject, mode);
        if (mode === 2) {
          parseForecastDate(metarPart, metarObject);
          // stays in mode
        }
        break;
      case 3:
        mode = parseVisibility(metarPart, metarObject, mode);
        if (mode === 3) {
          parseVariableWind(metarPart, metarObject);
          // stays in mode
        }
        break;
      case 4:
        parseCondition(metarPart, metarObject);
        // may occur multiple times
        break;
      case 5:
        parseClouds(metarPart, metarObject);
        // may occur multiple times
        break;
      case 6:
        mode = parseTemperature(metarPart, metarObject, mode);
        break;
      case 7:
        mode = parsePressure(metarPart, metarObject, mode);
        break;
    }
  });

  metarObject.ceiling = MetarParserHelpers.metarCeiling(metarObject.clouds);
  metarObject.flight_category = MetarParserHelpers.flightCategoryUs(metarObject.visibility, metarObject.ceiling);
  metarObject.icao_flight_category = MetarParserHelpers.flightCategoryIcao(metarObject.visibility, metarObject.ceiling);

  return metarObject;
};

// -----------------------------------------------------------------------------

function parseObservedDate(metarPart: string, metarObject: Metar, mode: ParserMode): ParserMode {
  const match = metarPart.match(/^(\d\d)(\d\d)(\d\d)Z$/);
  if (!match) {
    return mode;
  }
  metarObject.observed = MetarParserHelpers.date(Number(match[1]), Number(match[2]), Number(match[3]));
  return 2;
}

function parseWind(metarPart: string, metarObject: Metar, mode: ParserMode): ParserMode {
  // Case: Unkonw wind
  if (metarPart.match(/^\/+(KT|MPS|KPH)$/)) {
    return 3;
  }

  const match = metarPart.match(/^(\d\d\d|VRB)P?(\d+)(?:G(\d+))?(KT|MPS|KPH)/);
  if (!match) {
    return mode;
  }

  let speed_kts = Number(match[2]);
  let gust_kts = match[3] ? Number(match[3]) : null;
  if (match[4] === "KPH") {
    speed_kts = convert.kphToMps(speed_kts);
    gust_kts = gust_kts ? convert.kphToMps(gust_kts) : null;
    match[4] = "MPS";
  }
  const degrees = match[1] === "VRB" ? null : Number(match[1]);

  metarObject.wind = {
    degrees: degrees,
    speed_kts: match[4] === "MPS" ? convert.mpsToKts(speed_kts) : speed_kts,
    speed_mps: match[4] === "MPS" ? speed_kts : convert.ktsToMps(speed_kts),
    gust_kts: gust_kts ? (match[4] === "MPS" ? convert.mpsToKts(gust_kts) : gust_kts) : null,
    gust_mps: gust_kts ? (match[4] === "MPS" ? gust_kts : convert.ktsToMps(gust_kts)) : null,
    degrees_from: null,
    degrees_to: null,
  };
  if (match[1] === "VRB") {
    metarObject.wind.degrees_from = 0;
    metarObject.wind.degrees_to = 359;
  }

  return 3;
}

function parseForecastDate(metarPart: string, metarObject: Metar): void {
  const [, fromDate, fromHours, toDate, toHours] = metarPart.match(/^(\d\d)(\d\d)\/(\d\d)(\d\d)$/) || [];
  if (!fromDate) {
    return;
  }
  metarObject.forecastFrom = MetarParserHelpers.date(Number(fromDate), Number(fromHours), 0);
  metarObject.forecastTo = MetarParserHelpers.date(Number(toDate), Number(toHours), 0);
}

function parseVisibility(metarPart: string, metarObject: Metar, mode: ParserMode): ParserMode {
  // Case: No clouds & conditions reported
  if (metarPart === "CAVOK" || metarPart === "CLR") {
    metarObject.visibility = MetarParserHelpers.metarVisibility(10, convert.milesToMeters(10));
    return 5;
  }

  const [, digits, fraction, unit] = metarPart.match(/^[MP]?(\d+|\/{2,4})(?:\/(\d+))?(SM)?$/) || [];
  if (digits === undefined) {
    return mode;
  }

  // Case: Explicitly unknown visibility
  if (digits.match(/^\/+/)) {
    return 4;
  }

  // Case: Known visibility, possibly as fraction
  const visibility = fraction ? Number(digits) / Number(fraction) : Number(digits);
  metarObject.visibility = MetarParserHelpers.metarVisibility(
    unit === "SM" ? visibility : convert.metersToMiles(visibility),
    unit === "SM" ? convert.milesToMeters(visibility) : visibility,
  );

  return 4;
}

function parseVariableWind(metarPart: string, metarObject: Metar): void {
  if (!metarObject.wind) {
    return;
  }

  const [, degreesFrom, degreesTo] = metarPart.match(/^(\d+)V(\d+)$/) || [];
  if (degreesFrom || degreesTo) {
    metarObject.wind.degrees_from = Number(degreesFrom);
    metarObject.wind.degrees_to = Number(degreesTo);
  }
}

function parseCondition(metarPart: string, metarObject: Metar): void {
  const [, intensity, vicinity, code] = metarPart.match(/^(\+|-)?(VC|RE)?([A-Z]{2}(?:[A-Z]{2})?)$/) || [];
  if (!code) {
    return;
  }
  if (!metarObject.conditions) {
    metarObject.conditions = [];
  }
  metarObject.conditions.push({ intensity, vicinity, code });
}

function parseClouds(metarPart: string, metarObject: Metar) {
  const [, cloudType, cloudAltitude] = metarPart.match(/^(FEW|SCT|BKN|OVC|VV)(\d+)/) || [];
  if (cloudType && cloudAltitude) {
    metarObject.clouds.push(MetarParserHelpers.metarCloud(cloudType as MetarCloudCode, cloudAltitude));
  }
}

function parseTemperature(metarPart: string, metarObject: Metar, mode: ParserMode): ParserMode {
  const [, temp, dewpoint] = metarPart.match(/^(M?\d+|\/\/)\/(M?\d+|\/\/)?$/) || [];

  if (temp) {
    metarObject.temperature = MetarParserHelpers.metarTemperature(temp ?? "//");
    metarObject.dewpoint = MetarParserHelpers.metarTemperature(dewpoint ?? "//");
    metarObject.humidity = MetarParserHelpers.relativeHumidity(metarObject.temperature, metarObject.dewpoint);
    return 7;
  }
  return mode;
}

function parsePressure(metarPart: string, metarObject: Metar, mode: ParserMode): ParserMode {
  const [, unit, value] = metarPart.match(/^(Q|A)(\d+)/) || [];
  if (!unit || !value) {
    return mode;
  }

  const hg = Number(value) / (unit === "Q" ? 10 : 100);
  metarObject.barometer = {
    hg: unit === "Q" ? convert.kpaToInhg(hg) : hg,
    kpa: unit === "Q" ? hg : convert.inhgToKpa(hg),
    mb: unit === "Q" ? hg * 10 : convert.inhgToKpa(hg * 10),
  };
  return 8;
}

// -----------------------------------------------------------------------------

function initializeMetarObject(metarString: string): Metar {
  return {
    type: "METAR",
    raw_text: metarString,
    raw_parts: MetarParserHelpers.metarSplit(metarString),
    icao: "",
    observed: new Date(0),
    wind: {
      degrees: null,
      speed_kts: null,
      speed_mps: null,
      gust_kts: null,
      gust_mps: null,
      degrees_from: null,
      degrees_to: null,
    },
    visibility: null,
    conditions: [],
    clouds: [],
    ceiling: null,
    temperature: null,
    dewpoint: null,
    humidity: null,
    barometer: null,
    flight_category: null,
    icao_flight_category: null,
  };
}
