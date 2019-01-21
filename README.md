✈️ METAR parser
===============

Parse METAR information into structured JavaScript object. The structure of the returned object is closely related to the [API response of CheckWX](https://api.checkwx.com/#metar-fields).

Installation: `npm install aewx-metar-parser --save`

Code example
------------

```javascript
'use strict';
const metarParser = require('aewx-metar-parser');
const metarObject = metarParser('KEYW 050653Z AUTO 19006KT FEW024 BKN039 26/23 A3000 RMK AO2 LTG DSNT W SLP159 T02610228');

```

…returns:

```javascript
{ raw_text:
   'KEYW 050653Z AUTO 19006KT FEW024 BKN039 26/23 A3000 RMK AO2 LTG DSNT W SLP159 T02610228',
  raw_parts:
   [ 'KEYW',
     '050653Z',
     'AUTO',
     '19006KT',
     'FEW024',
     'BKN039',
     '26/23',
     'A3000',
     'RMK',
     'AO2',
     'LTG',
     'DSNT',
     'W',
     'SLP159',
     'T02610228' ],
  icao: 'KEYW',
  observed: Date('2019-01-05T06:53:12.540Z'),
  wind:
   { degrees: 190,
     speed_kts: 6,
     speed_mps: 3.086666654662963,
     gust_kts: 6,
     gust_mps: 3.086666654662963 },
  clouds:
   [ { code: 'FEW', base_feet_agl: 2400, base_meters_agl: 731.52 },
     { code: 'BKN', base_feet_agl: 3900, base_meters_agl: 1188.72 } ],
  ceiling:
   { code: 'BKN', base_feet_agl: 3900, base_meters_agl: 1188.72 },
  temperature: { celsius: 26, fahrenheit: 78.80000000000001 },
  dewpoint: { celsius: 23, fahrenheit: 73.4 },
  humidity_percent: 83.5653445347348,
  barometer: { hg: 30, kpa: 101.59164304435207, mb: 1015.9164304435207 } }
```


More information on METAR
--------------------------

Wikipedia has an [article on METAR information](https://en.wikipedia.org/wiki/METAR) explaining the very basics.

These sites make METAR information publicly available:

* https://en.allmetsat.com/metar-taf/
* https://aviationweather.gov/metar
* https://metars.com/

Status
-------

[![npm version](https://badge.fury.io/js/aewx-metar-parser.svg)](https://badge.fury.io/js/aewx-metar-parser)
[![Build Status](https://travis-ci.org/fboes/metar-parser.svg?branch=master)](https://travis-ci.org/fboes/metar-parser)
[![devDependency Status](https://david-dm.org/fboes/metar-parser/dev-status.svg)](https://david-dm.org/fboes/metar-parser?type=dev)

Legal stuff
-----------

Author: [Frank Boës](http://3960.org)

Copyright & license: See [LICENSE.txt](LICENSE.txt)
