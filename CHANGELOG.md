# Change log

## [Unreleaed]

## [4.1.0] - 2026-11-24

- Humidity may not be provided, returning `null`
- Pressure may not be provided, returning `null`
- Fixed date parser

## [4.0.0] - 2026-11-23

- Updated ESLint
- Visbility may not be provided, returning `null`
- Temperature / dewpoints may not be provided, returning `null`
- Wind may not be provided, returning `null`
- Required values for flight category may not be provided, returning `null`

## [3.0.2] - 2026-08-25

- Added array safe guarding

## [3.0.0] - 2026-06-19

- Added TAF support

## [2.0.1]

- Changed testing to standard Node.js testing suite
- Fixed `types` in `package.json`

## 2.0.0

- Changed to TypeScript
- Set `null` instead of `0` on missing information
- Fixed `ceiling` property
- Changed data structure to adhere to https://www.checkwxapi.com/metar

## 1.0.0

- Fix METAR interpretation if wind is missing

## 0.10.0

- Changed object properties to closer match CheckWX properties. This changes `conditions`, `ceiling`, `visibility`
- Add property `flight_category`
- If no visibility is given, assume 10 SM

## 0.9.3

- Improve handling of `VRB`

## 0.9.0

- Initial commit
