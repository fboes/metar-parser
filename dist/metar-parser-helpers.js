import * as convert from "./convert.js";
/**
 * @param {Number} value dito
 * @param {Number} toNext round to next full xxxx
 * @returns {Number} rounded value
 */
export function round(value, toNext = 500) {
    return Math.round(value / toNext) * toNext;
}
export function metarVisibility(visibility_miles, visibility_meters) {
    return {
        miles: visibility_miles,
        miles_text: String(round(visibility_miles, 0.5)),
        meters: visibility_meters,
        meters_text: String(round(visibility_meters, 500)),
    };
}
export function metarCloud(code, hundredFeet) {
    const feet = Number(hundredFeet) * 100;
    return {
        code: code,
        feet: feet,
        meters: convert.feetToMeters(feet),
    };
}
export function metarTemperature(temperatureString) {
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
export function relativeHumidity(temp, dew) {
    if (dew === null || temp === null) {
        return null;
    }
    const percent = (Math.exp((17.625 * dew.celsius) / (243.04 + dew.celsius)) /
        Math.exp((17.625 * temp.celsius) / (243.04 + temp.celsius))) *
        100;
    return { percent };
}
export function flightCategoryUs(visibility, ceiling) {
    if (visibility === null) {
        return null;
    }
    if (visibility.miles > 5 && (ceiling === null || ceiling.feet > 3000)) {
        return "VFR";
    }
    else if (visibility.miles >= 3 && (ceiling === null || ceiling.feet >= 1000)) {
        return "MVFR";
    }
    else if (visibility.miles >= 1 && (ceiling === null || ceiling.feet >= 500)) {
        return "IFR";
    }
    return "LIFR";
}
export function flightCategoryIcao(visibility, ceiling) {
    if (visibility === null) {
        return null;
    }
    return visibility.meters >= 5000 && (ceiling === null || ceiling.feet >= 1500) ? "VFR" : "IFR";
}
/**
 * @returns the lowest cloud layer reporting `BKN`, `OVC` or `VV`,
 *   or undefined if not such cloud layer was found.
 */
function findCeiling(clouds) {
    return clouds.find((c) => {
        return c.code === "BKN" || c.code === "OVC" || c.code === "VV";
    });
}
/**
 * @see findCeiling
 * @returns the ceiling by looking for the lowest cloud layer reporting `BKN`
 *  or `OVC`.
 */
export function metarCeiling(clouds) {
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
export function metarSplit(metarString) {
    return metarString
        .trim()
        .replace(/(\s)(\d)\s(\d)\/(\d)(SM)/, function (all, a, b, c, d, e) {
        // convert visbility range like `1 1/2 SM`
        return a + (Number(b) * Number(d) + Number(c)) + "/" + d + e;
    })
        .replace(/\n/, " \\n ")
        .split(/\s+/);
}
export function date(date, hours, minutes) {
    const now = new Date();
    const d = new Date(0);
    d.setUTCDate(date);
    d.setUTCMonth(now.getUTCMonth());
    d.setUTCFullYear(now.getUTCFullYear());
    d.setUTCHours(hours);
    d.setUTCMinutes(minutes);
    if (d.getTime() > now.getTime()) {
        d.setUTCMonth(d.getUTCMonth() - 1);
    }
    return d;
}
