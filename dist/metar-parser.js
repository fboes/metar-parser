import { convert } from "./convert.js";
/**
 * Convert METAR string into structured object.
 * @see     https://api.checkwx.com/#31-single
 * @see     https://www.skybrary.aero/index.php/Meteorological_Terminal_Air_Report_(METAR)
 * @param   {String}  metarString raw
 * @returns {MetarObject} with structured information. The object resembles the API
 *                   reponse of the data property of https://api.checkwx.com/#31-single
 */
export const metarParser = function (metarString) {
    const metarArray = metarString
        .trim()
        .replace(/^METAR\S*?\s/, "")
        .replace(/(\s)(\d)\s(\d)\/(\d)(SM)/, function (all, a, b, c, d, e) {
        // convert visbility range like `1 1/2 SM`
        return a + (Number(b) * Number(d) + Number(c)) + "/" + d + e;
    })
        .split(" ");
    if (metarArray.length < 3) {
        throw new Error("Not enough METAR information found");
    }
    const metarObject = {
        raw_text: metarString,
        raw_parts: metarArray,
        icao: "",
        observed: new Date(),
        wind: {
            degrees: 0,
            speed_kts: 0,
            speed_mps: 0,
            gust_kts: null,
            gust_mps: null,
            degrees_from: null,
            degrees_to: null,
        },
        visibility: {
            miles: "",
            miles_float: 10,
            meters: "",
            meters_float: 9999,
        },
        conditions: [],
        clouds: [],
        ceiling: null,
        temperature: {
            celsius: null,
            fahrenheit: null,
        },
        dewpoint: {
            celsius: null,
            fahrenheit: null,
        },
        humidity_percent: null,
        barometer: {
            hg: null,
            kpa: null,
            mb: null,
        },
        flight_category: null,
        icao_flight_category: null,
    };
    /**
     * @see http://andrew.rsmas.miami.edu/bmcnoldy/Humidity.html
     * @param {Number} temp in celsius
     * @param {Number} dew  in celsius
     * @returns {Number} humidity in 1/100
     */
    const calcHumidity = function (temp, dew) {
        return Math.exp((17.625 * dew) / (243.04 + dew)) / Math.exp((17.625 * temp) / (243.04 + temp));
    };
    /**
     * @param {Number} value dito
     * @param {Number} toNext round to next full xxxx
     * @returns {Number} rounded value
     */
    const round = function (value, toNext = 500) {
        return Math.round(value / toNext) * toNext;
    };
    // ---------------------------------------------------------------------------
    let mode = 0;
    metarArray.forEach((metarPart) => {
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
                    const degrees = match[1] === "VRB" ? 180 : Number(match[1]);
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
                    metarObject.visibility = {
                        miles: String(match[3] && match[3] === "SM" ? visibility : convert.metersToMiles(visibility)),
                        miles_float: match[3] && match[3] === "SM" ? visibility : convert.metersToMiles(visibility),
                        meters: String(match[3] && match[3] === "SM" ? convert.milesToMeters(visibility) : visibility),
                        meters_float: match[3] && match[3] === "SM" ? convert.milesToMeters(visibility) : visibility,
                    };
                    mode = 4;
                }
                else if (metarPart === "CAVOK" || metarPart === "CLR") {
                    metarObject.visibility = {
                        miles: String(10),
                        miles_float: 10,
                        meters: String(convert.milesToMeters(10)),
                        meters_float: convert.milesToMeters(10),
                    };
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
                    const base_feet_agl = Number(match[2]) * 100;
                    const cloud = {
                        code: match[1],
                        base_feet_agl: base_feet_agl,
                        base_meters_agl: convert.feetToMeters(base_feet_agl),
                    };
                    metarObject.clouds.push(cloud);
                }
                break;
            case 6:
                // Temperature
                match = metarPart.match(/^(M?\d+)\/(M?\d+)$/);
                if (match === null && metarPart.match(/^\/\/\/\/\/$/)) {
                    mode = 7;
                    break;
                }
                if (match) {
                    const temperature = Number(match[1].replace("M", "-"));
                    const dewpoint = Number(match[2].replace("M", "-"));
                    metarObject.temperature = {
                        celsius: temperature,
                        fahrenheit: convert.celsiusToFahrenheit(temperature),
                    };
                    metarObject.dewpoint = {
                        celsius: dewpoint,
                        fahrenheit: convert.celsiusToFahrenheit(dewpoint),
                    };
                    metarObject.humidity_percent = calcHumidity(temperature, dewpoint) * 100;
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
    // Finishing touches
    metarObject.visibility.miles = String(round(metarObject.visibility.miles_float, 0.5));
    metarObject.visibility.meters = String(round(metarObject.visibility.meters_float));
    const lowestFourOctasCloud = metarObject.clouds.find((c) => {
        return c.code === "BKN" || c.code === "OVC";
    });
    if (lowestFourOctasCloud) {
        metarObject.ceiling = lowestFourOctasCloud;
    }
    if (metarObject.visibility.miles_float > 5 && (!metarObject.ceiling || metarObject.ceiling.base_feet_agl > 3000)) {
        metarObject.flight_category = "VFR";
    }
    else if (metarObject.visibility.miles_float >= 3 &&
        (!metarObject.ceiling || metarObject.ceiling.base_feet_agl >= 1000)) {
        metarObject.flight_category = "MVFR";
    }
    else if (metarObject.visibility.miles_float >= 1 &&
        (!metarObject.ceiling || metarObject.ceiling.base_feet_agl >= 500)) {
        metarObject.flight_category = "IFR";
    }
    else {
        metarObject.flight_category = "LIFR";
    }
    metarObject.icao_flight_category =
        metarObject.visibility.meters_float >= 5000 && (!metarObject.ceiling || metarObject.ceiling.base_feet_agl >= 1500)
            ? "VFR"
            : "IFR";
    return metarObject;
};
