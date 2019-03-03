'use strict';

const assert      = require('assert');

const metarParser = require('../lib/metar-parser');
const convert = require('../lib/convert');

describe('metarParser', function() {

  const metarTestcases = [
    {
      source: 'https://aviationweather.gov/metar#1',
      metarCode: "KEYW 041053Z AUTO 13005KT 10SM CLR 24/22 A3000 RMK AO2 SLP159 T02440222",
      expectedValues: [
        ['icao', 'KEYW'],
        ['wind', {degrees: 130, speed_kts: 5, gust_kts: 5}],
        ['visibility', { meters: "16000", meters_float: convert.milesToMeters(10) }],
        ['temperature', { celsius: 24, fahrenheit: 75.2 }],
        ['barometer', {kpa: 3000 / 10 / 2.9529988 }],
        ['flight_category', 'VFR']
      ],
      output: false
    },
    {
      source: 'https://aviationweather.gov/metar#2',
      metarCode: "KACV 041053Z AUTO 07003KT 10SM CLR 04/04 A3001 RMK AO2 SLP169 T00440039",
      expectedValues: [
        ['icao', 'KACV'],
        ['wind', {degrees: 70, speed_kts: 3, gust_kts: 3}],
        ['visibility', { meters: "16000", meters_float: convert.milesToMeters(10) }],
        ['temperature', { celsius: 4, fahrenheit: 39.2 }],
        ['barometer', { hg: 30.01, kpa: convert.inhgToKpa(30.01) }],
        ['flight_category', 'VFR']
      ],
      output: false
    },
    {
      source: 'https://api.checkwx.com/#1',
      metarCode: "KPIE 260853Z AUTO 02013G17KT 10SM CLR 17/07 A2998 RMK AO2 SLP153 T01720072 57000",
      expectedValues: [
        ['icao', 'KPIE'],
        ['wind', {degrees: 20, speed_kts: 13, gust_kts: 17}],
        ['visibility', { meters: "16000", meters_float: convert.milesToMeters(10) }],
        ['temperature', { celsius: 17, fahrenheit: 62.6 }],
        ['barometer', { hg: 29.98, kpa: convert.inhgToKpa(29.98) }],
        ['flight_category', 'VFR']
      ],
      output: false
    },
    {
      source: 'https://api.checkwx.com/#2',
      metarCode: "KSPG 260853Z AUTO 05012KT 10SM CLR 18/09 A2997 RMK AO2 SLP148 T01830094 53001",
      expectedValues: [
        ['icao', 'KSPG'],
        ['wind', {degrees: 50, speed_kts: 12, gust_kts: 12}],
        ['visibility', { meters: "16000", meters_float: convert.milesToMeters(10) }],
        ['temperature', { celsius: 18, fahrenheit: 64.4 }],
        ['barometer', {kpa: 2997 / 10 / 2.9529988 }],
        ['flight_category', 'VFR']
      ],
      output: false
    },
    {
      source: 'https://de.wikipedia.org/wiki/METAR',
      metarCode: "EDDS 081620Z 29010KT 9999 FEW040TCU 09/M03 Q1012 NOSIG",
      expectedValues: [
        ['icao', 'EDDS'],
        ['wind', {
          degrees: 290,
          speed_kts: 10,
          speed_mps: convert.ktsToMps(10),
          gust_kts:  10,
          gust_mps:  convert.ktsToMps(10)
        }],
        ['visibility', { meters: "10000", meters_float: 9999 }],
        ['clouds', [{base_feet_agl: 4000, code: 'FEW'}]],
        ['temperature', { celsius: 9, fahrenheit: 48.2 }],
        ['barometer', {kpa: 101.2 }],
        ['flight_category', 'VFR']
      ],
      output: false
    },
    {
      source: 'https://en.wikipedia.org/wiki/METAR#1',
      metarCode: "METAR LBBG 041600Z 12012MPS 090V150 1400 R04/P1500N R22/P1500U +SN BKN022 OVC050 M04/M07 Q1020 NOSIG 8849//91=",
      expectedValues: [
        ['icao', 'LBBG'],
        ['wind', {
          degrees: 120,
          speed_kts: convert.mpsToKts(12),
          speed_mps: 12,
          gust_kts:  convert.mpsToKts(12),
          gust_mps:  12
        }],
        ['visibility', { meters: "1500", meters_float: 1400 }],
        ['conditions', [ {code: '+'}, {code: 'SN'} ]],
        ['clouds', [{base_feet_agl: 2200, code: 'BKN'}, {base_feet_agl: 5000, code: 'OVC'}]],
        ['temperature', { celsius: -4, fahrenheit: 24.8 }],
        ['barometer', {kpa: 102.0 }],
        ['flight_category', 'LIFR']
      ],

      output: false
    },
    {
      source: 'https://en.wikipedia.org/wiki/METAR#2',
      metarCode: "METAR KTTN 051853Z 04011KT 1/2SM VCTS SN FZFG BKN003 OVC010 M02/M02 A3006 RMK AO2 TSB40 SLP176 P0002 T10171017=",
      expectedValues: [
        ['icao', 'KTTN'],
        ['wind', {degrees: 40, speed_kts: 11, gust_kts: 11}],
        ['visibility', { meters: "1000", meters_float: convert.milesToMeters(0.5) }],
        ['conditions', [ {code: 'VC'}, {code: 'TS'}, {code: 'SN'}, {code: 'FZ'}, {code: 'FG'} ]],
        ['clouds', [{base_feet_agl: 300, code: 'BKN'}, {base_feet_agl: 1000, code: 'OVC'}]],
        ['temperature', { celsius: -2, fahrenheit: 28.4 }],
        ['barometer', {kpa: convert.inhgToKpa(30.06) }],
        ['flight_category', 'LIFR']
      ],
      output: false
    },
    {
      source: 'https://en.allmetsat.com/metar-taf/#1',
      metarCode: "KEYW 041053Z AUTO 13005KT 10SM CLR 24/22 A3000 RMK AO2 SLP159 T02440222",
      expectedValues: [
        ['icao', 'KEYW'],
        ['wind', {degrees: 130, speed_kts: 5, gust_kts: 5}],
        ['visibility', { meters: "16000", meters_float: convert.milesToMeters(10) }],
        ['temperature', { celsius: 24 }],
        ['barometer', {kpa: 3000 / 10 / 2.9529988 }],
        ['flight_category', 'VFR']
      ],
      output: false
    },
    {
      source: 'https://en.allmetsat.com/metar-taf/#2',
      metarCode: "EDDH 041050Z 29013KT 6000 SCT006 BKN009 04/03 Q1028 TEMPO BKN012",
      expectedValues: [
        ['icao', 'EDDH'],
        ['wind', {degrees: 290, speed_kts: 13, gust_kts: 13}],
        ['visibility', { meters: "6000", meters_float: 6000 }],
        ['clouds', [{base_feet_agl: 600, code: 'SCT'}, {base_feet_agl: 900, code: 'BKN'}]],
        ['temperature', { celsius: 4, fahrenheit: 39.2 }],
        ['barometer', {kpa: 102.8 }],
        ['flight_category', 'IFR']
      ],
      output: false
    },
    {
      source: 'https://en.allmetsat.com/metar-taf/#3',
      metarCode: "ETEB 041056Z AUTO 26010KT 9999 SCT090 00/M01 A3052 RMK AO2 SLP378 T10031013",
      expectedValues: [
        ['icao', 'ETEB'],
        ['wind', {degrees: 260, speed_kts: 10, gust_kts: 10}],
        ['visibility', { meters: "10000", meters_float: 9999 }],
        ['clouds', [{base_feet_agl: 9000, code: 'SCT'}]],
        ['temperature', { celsius: 0, fahrenheit: 32 }],
        ['barometer', {kpa: 3052 / 10 / 2.9529988 }],
        ['flight_category', 'VFR']
      ],
      output: false
    },
    {
      source: 'https://aviationweather.gov/metar/#3',
      metarCode: "KEYW 050653Z AUTO 19006KT FEW024 BKN039 26/23 A3000 RMK AO2 LTG DSNT W SLP159 T02610228",
      expectedValues: [
        ['icao', 'KEYW'],
        ['wind', {degrees: 190, speed_kts: 6, gust_kts: 6}],
        ['clouds', [{base_feet_agl: 2400, code: 'FEW'}, {base_feet_agl: 3900, code: 'BKN'}]],
        ['temperature', { celsius: 26 }],
        ['barometer', {kpa: 3000 / 10 / 2.9529988 }],
        ['flight_category', 'VFR']
      ],
      output: false
    },
    {
      source: 'https://api.checkwx.com/#2019-01-07',
      metarCode: 'KSFO 070121Z 19023KT 1 1/2SM R28R/6000VP6000FT -RA BKN004 BKN013 OVC035 15/12 A2970 RMK AO2 T01500122 PNO $',
      expectedValues: [
        ['icao', 'KSFO'],
        ['conditions', [ {code: '-'}, {code: 'RA'} ]],
        ['visibility', { meters: "2500", meters_float: convert.milesToMeters(1.5) }],
        ['temperature', { celsius: 15, fahrenheit: 59 }],
        ['dewpoint', { celsius: 12, fahrenheit: 53.6 }],
        ['barometer', {kpa: 2970 / 10 / 2.9529988, mb: 2970 / 2.9529988 }],
        ['flight_category', 'IFR']
      ],
      output: false
    },
    {
      source: 'EHAM with CAVOK',
      metarCode: 'EHAM 100125Z 33004KT CAVOK M00/M01 Q1026 NOSIG',
      expectedValues: [
        ['visibility', { miles_float: 10, meters: "16000", meters_float: convert.milesToMeters(10) }],
        ['temperature', { celsius: -0, fahrenheit: 32 }],
        ['dewpoint', { celsius: -1, fahrenheit: 30.2 }],
        ['barometer', { hg: 102.6, kpa: 102.6, mb: 10.26 }],
        ['flight_category', 'VFR']
      ],
      output: false
    },
    {
      source: 'Without VIS because it is CLR',
      metarCode: 'KEYW 291553Z VRB03KT CLR 17/09 A3009 RMK AO2 SLP189 T01670089 $',
      expectedValues: [
        ['visibility', { miles_float: 10, meters: "16000", meters_float: convert.milesToMeters(10) }],
        ['wind', {degrees: 180, speed_kts: 3, gust_kts: 3}],
        ['temperature', { celsius: 17 }],
        ['dewpoint', { celsius: 9 }],
        ['flight_category', 'VFR']
      ],
      output: false
    },
    {
      source: 'AUTO does stuff?',
      metarCode: 'KDVO 022335Z AUTO 4SM BR BKN007 BKN013 12/12 A2988 RMK AO2',
      expectedValues: [
        ['visibility', { miles_float: 4, meters: "6500", meters_float: convert.milesToMeters(4) }]
      ],
      output: false
    }
  ];

  metarTestcases.forEach(function(test) {
    it('must convert METAR string from ' + test.source, function() {
      const metarData = metarParser(test.metarCode);
      if (test.output) {
        console.log(metarData);
      }
      assert.ok(metarData);
      assert.ok(metarData.raw_text);
      assert.ok(metarData.raw_parts);
      assert.ok(metarData.raw_parts.length > 2);
      if (metarData.visibility) {
        assert.ok(metarData.visibility.miles);
        assert.ok(metarData.visibility.meters);
      }
      if (metarData.clouds && metarData.clouds[0]) {
        assert.ok(metarData.clouds[0].code);
        assert.ok(metarData.clouds[0].base_feet_agl);
        assert.ok(metarData.clouds[0].base_meters_agl);
      }
      if (metarData.ceiling) {
        assert.ok(metarData.ceiling.code);
        assert.ok(metarData.ceiling.feet_agl);
        assert.ok(metarData.ceiling.meters_agl);
      }

      test.expectedValues.forEach((valueTest) => {
        assert.ok(metarData[valueTest[0]], 'Key present: ' + valueTest[0]);

        // Add missing values for tests
        switch (valueTest[0]) {
          case 'clouds':
            valueTest[1] = valueTest[1].map((cloud) => {
              if (!cloud.base_meters_agl) {
                cloud.base_meters_agl = convert.feetToMeters(cloud.base_feet_agl);
              }
              return cloud;
            });
            break;
        }

        // Actual testing
        switch (valueTest[0]) {
          case 'temperature':
          case 'dewpoint':
            assert.deepStrictEqual(metarData[valueTest[0]].celsius, valueTest[1].celsius, 'celsius match');
            break;
          case 'barometer':
            assert.deepStrictEqual(metarData[valueTest[0]].kpa, valueTest[1].kpa, 'kpa match');
            break;
          case 'wind':
            assert.deepStrictEqual(metarData[valueTest[0]].degrees, valueTest[1].degrees, 'degrees match');
            assert.deepStrictEqual(metarData[valueTest[0]].speed_kts, valueTest[1].speed_kts, 'speed_kts match');
            assert.deepStrictEqual(metarData[valueTest[0]].gust_kts, valueTest[1].gust_kts, 'gust_kts match');
            if (valueTest[1].speed_mps) {
              assert.deepStrictEqual(metarData[valueTest[0]].speed_mps, valueTest[1].speed_mps, 'speed_mps match');
            }
            if (valueTest[1].gust_mps) {
              assert.deepStrictEqual(metarData[valueTest[0]].gust_mps, valueTest[1].gust_mps, 'gust_mps match');
            }
            break;
          case 'visibility':
            assert.deepStrictEqual(metarData[valueTest[0]].meters, valueTest[1].meters, 'meters match');
            break;
          default:
            assert.deepStrictEqual(metarData[valueTest[0]], valueTest[1], 'Exact value match: ' + valueTest[0]);
            break;
        }
      });
    });
  });
});
