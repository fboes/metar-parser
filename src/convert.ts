export function celsiusToFahrenheit(celsius: number) {
  return celsius * 1.8 + 32;
}

export function feetToMeters(feet: number) {
  return feet * 0.3048;
}

export function milesToMeters(miles: number) {
  return miles * 1609.344;
}

export function metersToMiles(meters: number) {
  return meters / 1609.344;
}

export function inhgToKpa(inHg: number) {
  return inHg / 0.29529988;
}

export function kpaToInhg(kpa: number) {
  return kpa * 0.29529988;
}

export function kphToMps(kph: number) {
  return (kph / 3600) * 1000;
}

export function mpsToKts(mps: number) {
  return mps * 1.9438445;
}

export function ktsToMps(kts: number) {
  return kts / 1.9438445;
}
