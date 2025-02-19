# ✈️ METAR parser

Parse METAR information into structured JavaScript object. The structure of the returned object is closely related to the [API response of CheckWX](https://api.checkwx.com/#metar-fields).

Installation: `npm install aewx-metar-parser --save`

## Functionality

This METAR parser returns the following parts of a METAR string:

- ICAO code
- Date / time
- Wind speed (in knots, meters per second) & direction
- Visibility (in meters and miles)
- Weather phenomena
- Clouds
- Temperature (in °C & °F) & humidity
- Barometer pressure (in InHg, kpa & mb)

## Code example

```javascript
import { metarParser } from "./metar-parser.js";

const metarObject = metarParser(
  "KSFO 070121Z 19023KT 1 1/2SM R28R/6000VP6000FT -RA BKN004 BKN013 OVC035 15/12 A2970 RMK AO2 T01500122 PNO $",
);
```

…returns:

```json
{
  "raw_text": "KSFO 070121Z 19023KT 1 1/2SM R28R/6000VP6000FT -RA BKN004 BKN013 OVC035 15/12 A2970 RMK AO2 T01500122 PNO $",
  "raw_parts": [
    "KSFO",
    "070121Z",
    "19023KT",
    "3/2SM",
    "R28R/6000VP6000FT",
    "-RA",
    "BKN004",
    "BKN013",
    "OVC035",
    "15/12",
    "A2970",
    "RMK",
    "AO2",
    "T01500122",
    "PNO",
    "$"
  ],
  "icao": "KSFO",
  "observed": "2025-02-07T01:21:59.204Z",
  "wind": {
    "degrees": 190,
    "speed_kts": 23,
    "speed_mps": 11.832222176208026,
    "gust_kts": null,
    "gust_mps": null,
    "degrees_from": null,
    "degrees_to": null
  },
  "visibility": {
    "miles": "1.5",
    "miles_float": 1.5,
    "meters": "2500",
    "meters_float": 2414.016
  },
  "conditions": [{ "code": "-" }, { "code": "RA" }],
  "clouds": [
    { "code": "BKN", "base_feet_agl": 400, "base_meters_agl": 121.92 },
    { "code": "BKN", "base_feet_agl": 1300, "base_meters_agl": 396.24 },
    { "code": "OVC", "base_feet_agl": 3500, "base_meters_agl": 1066.8 }
  ],
  "ceiling": { "code": "BKN", "base_feet_agl": 400, "base_meters_agl": 121.92 },
  "temperature": { "celsius": 15, "fahrenheit": 59 },
  "dewpoint": { "celsius": 12, "fahrenheit": 53.6 },
  "humidity_percent": 82.26135295757305,
  "barometer": {
    "hg": 29.7,
    "kpa": 100.57572661390854,
    "mb": 1005.7572661390855
  },
  "flight_category": "IFR"
}
```

## More information on METAR

Wikipedia has an [article on METAR information](https://en.wikipedia.org/wiki/METAR) explaining the very basics.

These sites make METAR information publicly available:

- https://en.allmetsat.com/metar-taf/
- https://aviationweather.gov/metar
- https://metars.com/

## Status

[![npm version](https://badge.fury.io/js/aewx-metar-parser.svg)](https://badge.fury.io/js/aewx-metar-parser)
[![devDependency Status](https://david-dm.org/fboes/metar-parser/dev-status.svg)](https://david-dm.org/fboes/metar-parser?type=dev)

## Legal stuff

Author: [Frank Boës](https://3960.org)

Copyright & license: See [LICENSE.txt](LICENSE.txt)
