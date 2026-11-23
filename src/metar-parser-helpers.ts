import * as convert from "./convert.js";
import type {
  MetarVisibility,
  MetarCloudCode,
  MetarCloud,
  MetarTemperature,
  MetarCeiling,
  MetarFlightCategory,
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

export function getVisibility(visibility_miles: number, visibility_meters: number): MetarVisibility {
  return {
    miles: visibility_miles,
    miles_text: String(round(visibility_miles, 0.5)),
    meters: visibility_meters,
    meters_text: String(round(visibility_meters, 500)),
  };
}

export function getCloud(code: MetarCloudCode, hundredFeet: string): MetarCloud {
  const feet = Number(hundredFeet) * 100;
  return {
    code: code,
    feet: feet,
    meters: convert.feetToMeters(feet),
  };
}

export function getTemperature(temperatureString: string): MetarTemperature {
  const temperature = Number(temperatureString.replace("M", "-"));
  return {
    celsius: temperature,
    fahrenheit: convert.celsiusToFahrenheit(temperature),
  };
}

/**
 * @see http://andrew.rsmas.miami.edu/bmcnoldy/Humidity.html
 */
export function getHumidity(temp: MetarTemperature, dew: MetarTemperature): number | null {
  if (dew.celsius === null || temp.celsius === null) {
    return null;
  }
  return (
    (Math.exp((17.625 * dew.celsius) / (243.04 + dew.celsius)) /
      Math.exp((17.625 * temp.celsius) / (243.04 + temp.celsius))) *
    100
  );
}

export function getFlightCategory(visibility: MetarVisibility, ceiling: MetarCeiling): MetarFlightCategory {
  if (visibility.miles > 5 && (ceiling.feet === null || ceiling.feet > 3000)) {
    return "VFR";
  } else if (visibility.miles >= 3 && (ceiling.feet === null || ceiling.feet >= 1000)) {
    return "MVFR";
  } else if (visibility.miles >= 1 && (ceiling.feet === null || ceiling.feet >= 500)) {
    return "IFR";
  }
  return "LIFR";
}

export function getIcaoFlightCategory(visibility: MetarVisibility, ceiling: MetarCeiling): MetarIcaoFlightCategory {
  return visibility.meters >= 5000 && (ceiling.feet === null || ceiling.feet >= 1500) ? "VFR" : "IFR";
}

export function getCeiling(clouds: MetarCloud[]): MetarCloud | undefined {
  return clouds.find((c) => {
    return c.code === "BKN" || c.code === "OVC";
  });
}

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
