import * as convert from "./convert.js";
import type {
  MetarVisibility,
  MetarCloudCode,
  MetarCloud,
  MetarTemperature,
  MetarCeiling,
  MetarFlightCategory as MetarUsFlightCategory,
  MetarIcaoFlightCategory,
} from "./metar-parser.type.js";

/**
 * @param {Number} value dito
 * @param {Number} toNext round to next full xxxx
 * @returns {Number} rounded value
 */
export function round(value: number, toNext: number = 500): number {
  return Math.round(value / toNext) * toNext;
}

export function metarVisibility(visibility_miles: number, visibility_meters: number): MetarVisibility {
  return {
    miles: visibility_miles,
    miles_text: String(round(visibility_miles, 0.5)),
    meters: visibility_meters,
    meters_text: String(round(visibility_meters, 500)),
  };
}

export function metarCloud(code: MetarCloudCode, hundredFeet: string): MetarCloud {
  const feet = Number(hundredFeet) * 100;
  return {
    code: code,
    feet: feet,
    meters: convert.feetToMeters(feet),
  };
}

export function metarTemperature(temperatureString: string): MetarTemperature | null {
  if (temperatureString === "//") {
    return null;
  }
  const temperature = Number(temperatureString.replace("M", "-"));
  return {
    celsius: temperature,
    fahrenheit: convert.celsiusToFahrenheit(temperature),
  };
}

/**
 * @see http://andrew.rsmas.miami.edu/bmcnoldy/Humidity.html
 */
export function relativeHumidityPercent(temp: MetarTemperature | null, dew: MetarTemperature | null): number | null {
  if (dew === null || temp === null) {
    return null;
  }
  return (
    (Math.exp((17.625 * dew.celsius) / (243.04 + dew.celsius)) /
      Math.exp((17.625 * temp.celsius) / (243.04 + temp.celsius))) *
    100
  );
}

export function flightCategoryUs(
  visibility: MetarVisibility | null,
  ceiling: MetarCeiling | null,
): MetarUsFlightCategory | null {
  if (visibility === null) {
    return null;
  }

  if (visibility.miles > 5 && (ceiling === null || ceiling.feet > 3000)) {
    return "VFR";
  } else if (visibility.miles >= 3 && (ceiling === null || ceiling.feet >= 1000)) {
    return "MVFR";
  } else if (visibility.miles >= 1 && (ceiling === null || ceiling.feet >= 500)) {
    return "IFR";
  }
  return "LIFR";
}

export function flightCategoryIcao(
  visibility: MetarVisibility | null,
  ceiling: MetarCeiling | null,
): MetarIcaoFlightCategory | null {
  if (visibility === null) {
    return null;
  }

  return visibility.meters >= 5000 && (ceiling === null || ceiling.feet >= 1500) ? "VFR" : "IFR";
}

/**
 * @returns the lowest cloud layer reporting `BKN` or `OVC`, or undefined if
 *   not such cloud layer was found.
 */
function findCeiling(clouds: MetarCloud[]): MetarCloud | undefined {
  return clouds.find((c) => {
    return c.code === "BKN" || c.code === "OVC";
  });
}

/**
 * @see findCeiling
 * @returns the ceiling by looking for the lowest cloud layer reporting `BKN`
 *  or `OVC`.
 */
export function metarCeiling(clouds: MetarCloud[]): MetarCeiling | null {
  const ceilingCloud = findCeiling(clouds);

  if (!ceilingCloud) {
    return null;
  }

  return {
    feet: ceilingCloud.feet,
    meters: ceilingCloud.meters,
  };
}

/**
 * @return METAR string split along its white spaces. Will convert fractional
 *   visibility values into one concatenated value.
 */
export function metarSplit(metarString: string): string[] {
  return metarString
    .trim()
    .replace(/(\s)(\d)\s(\d)\/(\d)(SM)/, function (all, a, b, c, d, e) {
      // convert visbility range like `1 1/2 SM`
      return a + (Number(b) * Number(d) + Number(c)) + "/" + d + e;
    })
    .replace(/\n/, " \\n ")
    .split(/\s+/);
}
