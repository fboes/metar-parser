# Change log

## 2.0.0

- Changed to TypeScript
- Set `null` instead of `0` on missing information
- Fixed `ceiling` property

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
