export interface MetarCode {
  intensity?: string;
  vicinity?: string;
  code: string;
}

export interface MetarWind {
  degrees: number | null;
  speed_kts: number | null;
  speed_mps: number | null;
  gust_kts: number | null;
  gust_mps: number | null;
  degrees_from: number | null;
  degrees_to: number | null;
}

export interface MetarVisibility {
  miles: number;
  miles_text: string;
  meters: number;
  meters_text: string;
}

export type MetarCloudCode = "FEW" | "SCT" | "BKN" | "OVC" | "VV";

export interface MetarCloud {
  code: MetarCloudCode;
  feet: number;
  meters: number;
  cloudType?: string;
}

/**
 * Ceiling values of lowest cloud layer reporting `BKN`, `OVC` or `VV`.
 * Values will be `null` if no such layer was found.
 */
export interface MetarCeiling {
  /**
   * Ceiling in feet of lowest cloud layer reporting `BKN`, `OVC` or `VV`.
   * Ceiling in feet will be `null` if no such layer was found.
   */
  feet: number;
  /**
   * Ceiling in meters of lowest cloud layer reporting `BKN`, `OVC` or `VV`.
   * Ceiling in meters will be `null` if no such layer was found.
   */
  meters: number;
}

export interface MetarTemperature {
  celsius: number;
  fahrenheit: number;
}

export interface MetarHumidity {
  percent: number;
}

export interface MetarPressure {
  hg: number;
  kpa: number;
  mb: number;
}

export type MetarIcaoFlightCategory = "VFR" | "IFR";

export type MetarFlightCategory = MetarIcaoFlightCategory | "MVFR" | "LIFR";

export interface Metar {
  type: "METAR" | "TAF";
  raw_text: string;
  raw_parts: string[];
  icao: string;
  observed: Date;
  forecastFrom?: Date;
  forecastTo?: Date;

  wind: MetarWind;
  visibility: MetarVisibility | null;
  conditions: MetarCode[];
  clouds: MetarCloud[];
  ceiling: MetarCeiling | null;
  temperature: MetarTemperature | null;
  dewpoint: MetarTemperature | null;
  humidity: MetarHumidity | null;
  barometer: MetarPressure | null;
  flight_category: MetarFlightCategory | null;
  icao_flight_category: MetarIcaoFlightCategory | null;
}
