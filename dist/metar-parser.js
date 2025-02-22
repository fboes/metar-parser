import { convert } from "./convert.js";
class MetarParserHelpers {
    /**
     * @param {Number} value dito
     * @param {Number} toNext round to next full xxxx
     * @returns {Number} rounded value
     */
    static round(value, toNext = 500) {
        return Math.round(value / toNext) * toNext;
    }
    static getVisibility(visibility_miles, visibility_meters) {
        return {
            miles: visibility_miles,
            miles_text: String(MetarParserHelpers.round(visibility_miles, 0.5)),
            meters: visibility_meters,
            meters_text: String(MetarParserHelpers.round(visibility_meters, 500)),
        };
    }
    static getCloud(code, hundredFeet) {
        const feet = Number(hundredFeet) * 100;
        return {
            code: code,
            feet: feet,
            meters: convert.feetToMeters(feet),
        };
    }
    static getTemperature(temperatureString) {
        const temperature = Number(temperatureString.replace("M", "-"));
        return {
            celsius: temperature,
            fahrenheit: convert.celsiusToFahrenheit(temperature),
        };
    }
    /**
     * @see http://andrew.rsmas.miami.edu/bmcnoldy/Humidity.html
     */
    static getHumidity(temp, dew) {
        if (dew.celsius === null || temp.celsius === null) {
            return null;
        }
        return ((Math.exp((17.625 * dew.celsius) / (243.04 + dew.celsius)) /
            Math.exp((17.625 * temp.celsius) / (243.04 + temp.celsius))) *
            100);
    }
    static getFlightCategory(visibility, ceiling) {
        if (visibility.miles > 5 && (!ceiling.feet || ceiling.feet > 3000)) {
            return "VFR";
        }
        else if (visibility.miles >= 3 && (!ceiling.feet || ceiling.feet >= 1000)) {
            return "MVFR";
        }
        else if (visibility.miles >= 1 && (!ceiling.feet || ceiling.feet >= 500)) {
            return "IFR";
        }
        return "LIFR";
    }
    static getIcaoFLightCategory(visibility, ceiling) {
        return visibility.meters >= 5000 && (!ceiling.feet || ceiling.feet >= 1500) ? "VFR" : "IFR";
    }
    static getCeiling(clouds) {
        return clouds.find((c) => {
            return c.code === "BKN" || c.code === "OVC";
        });
    }
    static metarSplit(metarString) {
        return metarString
            .trim()
            .replace(/^METAR\S*?\s/, "")
            .replace(/(\s)(\d)\s(\d)\/(\d)(SM)/, function (all, a, b, c, d, e) {
            // convert visbility range like `1 1/2 SM`
            return a + (Number(b) * Number(d) + Number(c)) + "/" + d + e;
        })
            .split(" ");
    }
}
/**
 * Convert METAR string into structured object.
 * @see     https://api.checkwx.com/#31-single
 * @see     https://www.skybrary.aero/index.php/Meteorological_Terminal_Air_Report_(METAR)
 * @param   {String}  metarString raw
 * @returns {Metar} with structured information. The object resembles the API
 *                   reponse of the data property of https://www.checkwxapi.com/metar
 */
export const metarParser = (metarString) => {
    const metarObject = {
        raw_text: metarString,
        raw_parts: MetarParserHelpers.metarSplit(metarString),
        icao: "",
        observed: new Date(),
        wind: {
            degrees: null,
            speed_kts: 0,
            speed_mps: 0,
            gust_kts: null,
            gust_mps: null,
            degrees_from: null,
            degrees_to: null,
        },
        visibility: {
            miles: 10,
            miles_text: "",
            meters: 9999,
            meters_text: "",
        },
        conditions: [],
        clouds: [],
        ceiling: {
            feet: null,
            meters: null,
        },
        temperature: {
            celsius: null,
            fahrenheit: null,
        },
        dewpoint: {
            celsius: null,
            fahrenheit: null,
        },
        humidity: {
            percent: null,
        },
        barometer: {
            hg: null,
            kpa: null,
            mb: null,
        },
        flight_category: null,
        icao_flight_category: null,
    };
    let mode = 0;
    metarObject.raw_parts.forEach((metarPart) => {
        let match;
        if (mode < 3 && metarPart.match(/^(\d+)(?:\/(\d+))?(SM)?$/)) {
            mode = 3; // no wind reported
        }
        if (mode < 5 && metarPart.match(/^(FEW|SCT|BKN|OVC)(\d+)?/)) {
            mode = 5; // no visibility / conditions reported
        }
        if (mode < 6 && metarPart.match(/(^M?\d+\/M?\d+$)|(^\/\/\/\/\/)/)) {
            mode = 6; // end of clouds
        }
        switch (mode) {
            case 0:
                // ICAO Code
                metarObject.icao = metarPart;
                mode = 1;
                break;
            case 1:
                // Observed Date
                match = metarPart.match(/^(\d\d)(\d\d)(\d\d)Z$/);
                if (match) {
                    metarObject.observed = new Date();
                    metarObject.observed.setUTCDate(Number(match[1]));
                    metarObject.observed.setUTCHours(Number(match[2]));
                    metarObject.observed.setUTCMinutes(Number(match[3]));
                    mode = 2;
                }
                break;
            case 2:
                // Wind
                match = metarPart.match(/^(\d\d\d|VRB)P?(\d+)(?:G(\d+))?(KT|MPS|KPH)/);
                if (match) {
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
                    mode = 3;
                }
                break;
            case 3:
                // Visibility
                match = metarPart.match(/^(\d+)(?:\/(\d+))?(SM)?$/);
                if (match) {
                    const visibility = match[2] ? Number(match[1]) / Number(match[2]) : Number(match[1]);
                    metarObject.visibility = MetarParserHelpers.getVisibility(match[3] && match[3] === "SM" ? visibility : convert.metersToMiles(visibility), match[3] && match[3] === "SM" ? convert.milesToMeters(visibility) : visibility);
                    mode = 4;
                }
                else if (metarPart === "CAVOK" || metarPart === "CLR") {
                    metarObject.visibility = MetarParserHelpers.getVisibility(10, convert.milesToMeters(10));
                    mode = 5; // no clouds & conditions reported
                }
                else if (metarObject.wind) {
                    // Variable wind direction
                    match = metarPart.match(/^(\d+)V(\d+)$/);
                    if (match) {
                        metarObject.wind.degrees_from = Number(match[1]);
                        metarObject.wind.degrees_to = Number(match[2]);
                    }
                }
                break;
            case 4:
                // Conditions
                match = metarPart.match(/^(\+|-|VC|RE)?([A-Z][A-Z])([A-Z][A-Z])?([A-Z][A-Z])?$/);
                if (match) {
                    if (!metarObject.conditions) {
                        metarObject.conditions = [];
                    }
                    match
                        .filter((m, index) => {
                        return index !== 0 && m;
                    })
                        .forEach((m) => {
                        metarObject.conditions.push({ code: m });
                    });
                    // may occur multiple times
                }
                break;
            case 5:
                // Clouds
                match = metarPart.match(/^(FEW|SCT|BKN|OVC)(\d+)/);
                if (match) {
                    metarObject.clouds.push(MetarParserHelpers.getCloud(match[1], match[2]));
                }
                // may occur multiple times
                break;
            case 6:
                // Temperature
                match = metarPart.match(/^(M?\d+)\/(M?\d+)$/);
                if (match === null && metarPart.match(/^\/\/\/\/\/$/)) {
                    mode = 7;
                    break;
                }
                if (match) {
                    metarObject.temperature = MetarParserHelpers.getTemperature(match[1]);
                    metarObject.dewpoint = MetarParserHelpers.getTemperature(match[2]);
                    metarObject.humidity.percent = MetarParserHelpers.getHumidity(metarObject.temperature, metarObject.dewpoint);
                    mode = 7;
                }
                break;
            case 7:
                // Pressure
                match = metarPart.match(/^(Q|A)(\d+)/);
                if (match) {
                    let hg = Number(match[2]);
                    hg /= match[1] === "Q" ? 10 : 100;
                    metarObject.barometer = {
                        hg: match[1] === "Q" ? convert.kpaToInhg(hg) : hg,
                        kpa: match[1] === "Q" ? hg : convert.inhgToKpa(hg),
                        mb: match[1] === "Q" ? hg * 10 : convert.inhgToKpa(hg * 10),
                    };
                    mode = 8;
                }
                break;
        }
    });
    const ceilingCloud = MetarParserHelpers.getCeiling(metarObject.clouds);
    metarObject.ceiling.feet = ceilingCloud?.feet ?? null;
    metarObject.ceiling.meters = ceilingCloud?.meters ?? null;
    metarObject.flight_category = MetarParserHelpers.getFlightCategory(metarObject.visibility, metarObject.ceiling);
    metarObject.icao_flight_category = MetarParserHelpers.getIcaoFLightCategory(metarObject.visibility, metarObject.ceiling);
    return metarObject;
};
