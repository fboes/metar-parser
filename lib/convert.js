'use strict';

/**
 * Convert units
 */
const convert = {
  celsiusToFahrenheit: function(celsius) {
    return celsius * 1.8 + 32;
  },

  feetToMeters: function(feet) {
    return feet * 0.3048;
  },

  milesToMeters: function(miles) {
    return miles * 1609.344;
  },

  metersToMiles: function(meters) {
    return meters / 1609.344;
  },

  inhgToKpa: function(inHg) {
    return inHg / 0.29529988;
  },

  kpaToInhg: function(kpa) {
    return kpa * 0.29529988;
  },

  kphToMps: function(kph) {
    return kph / 3600 * 1000;
  },

  mpsToKts: function(mps) {
    return mps * 1.9438445;
  },

  ktsToMps: function(kts) {
    return kts / 1.9438445;
  }
};

module.exports = convert;
