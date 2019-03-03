'use strict';

const convert = require('./convert');

/**
 * Convert METAR string into structured object.
 * @see     https://api.checkwx.com/#31-single
 * @see     https://www.skybrary.aero/index.php/Meteorological_Terminal_Air_Report_(METAR)
 * @param   {String}  metarString raw
 * @returns {Object} with structured information. The object resembles the API
 *                   reponse of the data property of https://api.checkwx.com/#31-single
 */
const metarParser = function(metarString) {
  let metarArray = metarString
    .trim()
    .replace(/^METAR\S*?\s/, '')
    .replace(/(\s)(\d)\s(\d)\/(\d)(SM)/, function(all, a, b, c, d, e) {
      // convert visbility range like `1 1/2 SM`
      return a + (Number(b) * Number(d) +  Number(c)) + '/' + d + e;
    })
    .split(' ')
  ;
  if (metarArray.length < 3) {
    throw new Error('Not enough METAR information found');
  }

  let metarObject = {
    raw_text: metarString,
    raw_parts: metarArray
  };

  const _private = {};

  /**
   * @see http://andrew.rsmas.miami.edu/bmcnoldy/Humidity.html
   * @param {Number} temp in celsius
   * @param {Number} dew  in celsius
   * @returns {Number} humidity in 1/100
   */
  _private.calcHumidity = function(temp, dew) {
    return Math.exp(
      (17.625 * dew) / (243.04 + dew)
    ) / Math.exp(
      (17.625 * temp) / (243.04 + temp)
    );
  };

  /**
   * @param {Number} value dito
   * @param {Number} toNext round to next full xxxx
   * @returns {Number} rounded value
   */
  _private.round = function(value, toNext = 500) {
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
    if (mode < 6 && metarPart.match(/^M?\d+\/M?\d+$/)) {
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
          match[2] = Number(match[2]);
          match[3] = match[3] ? Number(match[3]) : match[2];
          if (match[4] === 'KPH') {
            match[2] = convert.kphToMps(match[2]);
            match[3] = convert.kphToMps(match[3]);
            match[4] = 'MPS';
          }

          metarObject.wind = {
            degrees:   (match[1] === 'VRB') ? 180 : Number(match[1]),
            speed_kts: (match[4] === 'MPS') ? convert.mpsToKts(match[2]) : match[2],
            speed_mps: (match[4] === 'MPS') ? match[2] : convert.ktsToMps(match[2]),
            gust_kts:  (match[4] === 'MPS') ? convert.mpsToKts(match[3]) : match[3],
            gust_mps:  (match[4] === 'MPS') ? match[3] : convert.ktsToMps(match[3])
          };
          if (match[1] === 'VRB') {
            metarObject.wind.degrees_from = 0;
            metarObject.wind.degrees_to   = 359;
          }
          mode = 3;
        }
        break;
      case 3:
        // Visibility
        match = metarPart.match(/^(\d+)(?:\/(\d+))?(SM)?$/);
        if (match) {
          match[1] = (match[2])
            ? Number(match[1]) / Number(match[2])
            : Number(match[1])
          ;
          metarObject.visibility = {
            miles:        (match[3] && match[3] === 'SM') ? match[1] : convert.metersToMiles(match[1]),
            miles_float:  (match[3] && match[3] === 'SM') ? match[1] : convert.metersToMiles(match[1]),
            meters:       (match[3] && match[3] === 'SM') ? convert.milesToMeters(match[1]) : match[1],
            meters_float: (match[3] && match[3] === 'SM') ? convert.milesToMeters(match[1]) : match[1]
          };

          mode = 4;
        } else if (metarPart === 'CAVOK' || metarPart === 'CLR') {
          metarObject.visibility = {
            miles:        10,
            miles_float:  10,
            meters:       convert.milesToMeters(10),
            meters_float: convert.milesToMeters(10)
          };
          mode = 5; // no clouds & conditions reported
        } else if (metarObject.wind) {
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
              return (index !== 0 && m);
            })
            .forEach((m) => {
              metarObject.conditions.push({ code: m });
            })
          ;
          // may occur multiple times
        }
        break;
      case 5:
        // Clouds
        match = metarPart.match(/^(FEW|SCT|BKN|OVC)(\d+)/);
        if (match) {
          if (!metarObject.clouds) {
            metarObject.clouds = [];
          }
          match[2] = Number(match[2]) * 100;
          let cloud = {
            code: match[1],
            base_feet_agl:   match[2],
            base_meters_agl: convert.feetToMeters(match[2])
          };
          metarObject.clouds.push(cloud);
        }
        break;
      case 6:
        // Temperature
        match = metarPart.match(/^(M?\d+)\/(M?\d+)$/);
        if (match) {
          match[1] = Number(match[1].replace('M', '-'));
          match[2] = Number(match[2].replace('M', '-'));
          metarObject.temperature = {
            celsius: match[1],
            fahrenheit: convert.celsiusToFahrenheit(match[1])
          };
          metarObject.dewpoint = {
            celsius: match[2],
            fahrenheit: convert.celsiusToFahrenheit(match[2])
          };
          metarObject.humidity_percent = _private.calcHumidity(match[1], match[2]) * 100;
          mode = 7;
        }
        break;
      case 7:
        // Pressure
        match = metarPart.match(/^(Q|A)(\d+)/);
        if (match) {
          match[2] = Number(match[2]);
          match[2] /= (match[1] === 'Q') ? 10 : 100;
          metarObject.barometer = {
            hg:  (match[1] === 'Q') ? convert.kpaToInhg(match[2]) : match[2],
            kpa: (match[1] === 'Q') ? match[2]                    : convert.inhgToKpa(match[2]),
            mb:  (match[1] === 'Q') ? match[2] * 10               : convert.inhgToKpa(match[2] * 10)
          };
          mode = 8;
        }
        break;
    }
  });

  if (!metarObject.visibility) {
    metarObject.visibility = {
      miles:        10,
      miles_float:  10,
      meters:       convert.milesToMeters(10),
      meters_float: convert.milesToMeters(10)
    };
  }

  // Finishing touches

  metarObject.visibility.miles = String(_private.round(metarObject.visibility.miles, 0.5));
  metarObject.visibility.meters = String(_private.round(metarObject.visibility.meters));

  if (metarObject.clouds) {
    const highestCloud = metarObject.clouds[metarObject.clouds.length - 1];
    metarObject.ceiling = {
      code: highestCloud.code,
      feet_agl:   highestCloud.base_feet_agl,
      meters_agl: highestCloud.base_meters_agl
    };
  }

  metarObject.flight_category = '';
  if (metarObject.visibility.miles_float > 5
    && (!metarObject.ceiling || metarObject.ceiling.feet_agl > 3000)
  ) {
    metarObject.flight_category = 'VFR';
  } else if (metarObject.visibility.miles_float >= 3
    && (!metarObject.ceiling || metarObject.ceiling.feet_agl >= 1000)
  ) {
    metarObject.flight_category = 'MVFR';
  } else if (metarObject.visibility.miles_float >= 1
    && (!metarObject.ceiling || metarObject.ceiling.feet_agl >= 500)
  ) {
    metarObject.flight_category = 'IFR';
  } else {
    metarObject.flight_category = 'LIFR';
  }

  return metarObject;
};

module.exports = metarParser;
