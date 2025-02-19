/**
 * Convert units
 */
export const convert = {
  celsiusToFahrenheit: function (celsius: number) {
    return celsius * 1.8 + 32;
  },

  feetToMeters: function (feet: number) {
    return feet * 0.3048;
  },

  milesToMeters: function (miles: number) {
    return miles * 1609.344;
  },

  metersToMiles: function (meters: number) {
    return meters / 1609.344;
  },

  inhgToKpa: function (inHg: number) {
    return inHg / 0.29529988;
  },

  kpaToInhg: function (kpa: number) {
    return kpa * 0.29529988;
  },

  kphToMps: function (kph: number) {
    return (kph / 3600) * 1000;
  },

  mpsToKts: function (mps: number) {
    return mps * 1.9438445;
  },

  ktsToMps: function (kts: number) {
    return kts / 1.9438445;
  },
};
