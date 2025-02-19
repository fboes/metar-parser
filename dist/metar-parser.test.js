import { strict as assert } from "node:assert";
import { metarParser } from "./metar-parser.js";
import { convert } from "./convert.js";
{
    // https://aviationweather.gov/metar#1
    const metar = "KEYW 041053Z AUTO 13005KT 10SM CLR 24/22 A3000 RMK AO2 SLP159 T02440222";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "KEYW");
    assert.deepStrictEqual(result.wind.degrees, 130);
    assert.deepStrictEqual(result.wind.speed_kts, 5);
    assert.deepStrictEqual(result.wind.gust_kts, null);
    assert.deepStrictEqual(result.visibility.meters, "16000");
    assert.deepStrictEqual(result.barometer.kpa, 3000 / 10 / 2.9529988);
    assert.deepStrictEqual(result.flight_category, "VFR");
}
{
    // https://aviationweather.gov/metar#2
    const metar = "KACV 041053Z AUTO 07003KT 10SM CLR 04/04 A3001 RMK AO2 SLP169 T00440039";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "KACV");
    assert.deepStrictEqual(result.wind.degrees, 70);
    assert.deepStrictEqual(result.wind.speed_kts, 3);
    assert.deepStrictEqual(result.wind.gust_kts, null);
    assert.deepStrictEqual(result.visibility.meters, "16000");
    assert.deepStrictEqual(result.temperature.celsius, 4);
    assert.deepStrictEqual(result.temperature.fahrenheit, 39.2);
    assert.deepStrictEqual(result.barometer.hg, 30.01);
    assert.deepStrictEqual(result.flight_category, "VFR");
}
{
    // https://api.checkwx.com/#1
    const metar = "KPIE 260853Z AUTO 02013G17KT 10SM CLR 17/07 A2998 RMK AO2 SLP153 T01720072 57000";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "KPIE");
    assert.deepStrictEqual(result.wind.degrees, 20);
    assert.deepStrictEqual(result.wind.speed_kts, 13);
    assert.deepStrictEqual(result.wind.gust_kts, 17);
    assert.deepStrictEqual(result.visibility.meters, "16000");
    assert.deepStrictEqual(result.visibility.miles, "10");
    assert.deepStrictEqual(result.temperature.celsius, 17);
    assert.deepStrictEqual(result.temperature.fahrenheit, 62.6);
    assert.deepStrictEqual(result.barometer.hg, 29.98);
    assert.deepStrictEqual(result.flight_category, "VFR");
}
{
    // https://api.checkwx.com/#2
    const metar = "KSPG 260853Z AUTO 05012KT 10SM CLR 18/09 A2997 RMK AO2 SLP148 T01830094 53001";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "KSPG");
    assert.deepStrictEqual(result.wind.degrees, 50);
    assert.deepStrictEqual(result.wind.speed_kts, 12);
    assert.deepStrictEqual(result.wind.gust_kts, null);
    assert.deepStrictEqual(result.visibility.meters, "16000");
    assert.deepStrictEqual(result.visibility.miles, "10");
    assert.deepStrictEqual(result.temperature.celsius, 18);
    assert.deepStrictEqual(result.temperature.fahrenheit, 64.4);
    assert.deepStrictEqual(result.barometer.kpa, 2997 / 10 / 2.9529988);
    assert.deepStrictEqual(result.flight_category, "VFR");
}
{
    // https://de.wikipedia.org/wiki/METAR
    const metar = "EDDS 081620Z 29010KT 9999 FEW040TCU 09/M03 Q1012 NOSIG";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "EDDS");
    assert.deepStrictEqual(result.wind.degrees, 290);
    assert.deepStrictEqual(result.wind.speed_kts, 10);
    assert.deepStrictEqual(result.wind.speed_mps, convert.ktsToMps(10));
    assert.deepStrictEqual(result.wind.gust_kts, null);
    assert.deepStrictEqual(result.wind.gust_mps, null);
    assert.deepStrictEqual(result.visibility.meters, "10000");
    assert.deepStrictEqual(result.visibility.meters_float, 9999);
    assert.deepStrictEqual(result.clouds.length, 1);
    assert.deepStrictEqual(result.clouds[0]?.base_feet_agl, 4000);
    assert.deepStrictEqual(result.clouds[0]?.code, "FEW");
    assert.deepStrictEqual(result.ceiling, null);
    assert.deepStrictEqual(result.temperature.celsius, 9);
    assert.deepStrictEqual(result.temperature.fahrenheit, 48.2);
    assert.deepStrictEqual(result.barometer.kpa, 101.2);
    assert.deepStrictEqual(result.flight_category, "VFR");
}
{
    // https://en.wikipedia.org/wiki/METAR#1
    const metar = "METAR LBBG 041600Z 12012MPS 090V150 1400 R04/P1500N R22/P1500U +SN BKN022 OVC050 M04/M07 Q1020 NOSIG 8849//91=";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "LBBG");
    assert.deepStrictEqual(result.wind.degrees, 120);
    assert.deepStrictEqual(result.wind.speed_kts, convert.mpsToKts(12));
    assert.deepStrictEqual(result.wind.speed_mps, 12);
    assert.deepStrictEqual(result.wind.gust_kts, null);
    assert.deepStrictEqual(result.wind.gust_mps, null);
    assert.deepStrictEqual(result.visibility.meters, "1500");
    assert.deepStrictEqual(result.visibility.meters_float, 1400);
    assert.deepStrictEqual(result.conditions, [{ code: "+" }, { code: "SN" }]);
    assert.deepStrictEqual(result.clouds.length, 2);
    assert.deepStrictEqual(result.clouds[0]?.base_feet_agl, 2200);
    assert.deepStrictEqual(result.clouds[0]?.code, "BKN");
    assert.deepStrictEqual(result.clouds[1]?.base_feet_agl, 5000);
    assert.deepStrictEqual(result.clouds[1]?.code, "OVC");
    assert.deepStrictEqual(result.clouds[0], result.ceiling);
    assert.deepStrictEqual(result.temperature.celsius, -4);
    assert.deepStrictEqual(result.temperature.fahrenheit, 24.8);
    assert.deepStrictEqual(result.barometer.kpa, 102.0);
    assert.deepStrictEqual(result.flight_category, "LIFR");
    assert.deepStrictEqual(result.icao_flight_category, "IFR");
}
{
    // https://en.wikipedia.org/wiki/METAR#2
    const metar = "METAR KTTN 051853Z 04011KT 1/2SM VCTS SN FZFG BKN003 OVC010 M02/M02 A3006 RMK AO2 TSB40 SLP176 P0002 T10171017=";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "KTTN");
    assert.deepStrictEqual(result.wind.degrees, 40);
    assert.deepStrictEqual(result.wind.speed_kts, 11);
    assert.deepStrictEqual(result.wind.gust_kts, null);
    assert.deepStrictEqual(result.visibility.meters, "1000");
    assert.deepStrictEqual(result.visibility.meters_float, convert.milesToMeters(0.5));
    //   ["conditions", [{ code: "VC" }, { code: "TS" }, { code: "SN" }, { code: "FZ" }, { code: "FG" }]],
    //   [
    //     "clouds",
    //     [
    //       { base_feet_agl: 300, code: "BKN" },
    //       { base_feet_agl: 1000, code: "OVC" },
    //     ],
    //   ],
    assert.deepStrictEqual(result.temperature.celsius, -2);
    assert.deepStrictEqual(result.temperature.fahrenheit, 28.4);
    assert.deepStrictEqual(result.barometer.hg, 30.06);
    assert.deepStrictEqual(result.flight_category, "LIFR");
}
{
    // https://en.allmetsat.com/metar-taf/#1
    const metar = "KEYW 041053Z AUTO 13005KT 10SM CLR 24/22 A3000 RMK AO2 SLP159 T02440222";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "KEYW");
    assert.deepStrictEqual(result.wind.degrees, 130);
    assert.deepStrictEqual(result.wind.speed_kts, 5);
    assert.deepStrictEqual(result.wind.gust_kts, null);
    assert.deepStrictEqual(result.visibility.meters, "16000");
    assert.deepStrictEqual(result.visibility.miles, "10");
    assert.deepStrictEqual(result.temperature.celsius, 24);
    assert.deepStrictEqual(result.barometer.kpa, 3000 / 10 / 2.9529988);
    assert.deepStrictEqual(result.flight_category, "VFR");
}
{
    // https://en.allmetsat.com/metar-taf/#2
    const metar = "EDDH 041050Z 29013KT 6000 SCT006 BKN009 04/03 Q1028 TEMPO BKN012";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "EDDH");
    assert.deepStrictEqual(result.wind.degrees, 290);
    assert.deepStrictEqual(result.wind.speed_kts, 13);
    assert.deepStrictEqual(result.wind.gust_kts, null);
    assert.deepStrictEqual(result.visibility.meters, "6000");
    assert.deepStrictEqual(result.visibility.meters_float, 6000);
    //   [
    //     "clouds",
    //     [
    //       { base_feet_agl: 600, code: "SCT" },
    //       { base_feet_agl: 900, code: "BKN" },
    //     ],
    //   ],
    assert.deepStrictEqual(result.temperature.celsius, 4);
    assert.deepStrictEqual(result.temperature.fahrenheit, 39.2);
    assert.deepStrictEqual(result.barometer.kpa, 102.8);
    assert.deepStrictEqual(result.flight_category, "IFR");
    assert.deepStrictEqual(result.icao_flight_category, "IFR");
}
{
    // https://en.allmetsat.com/metar-taf/#3
    const metar = "ETEB 041056Z AUTO 26010KT 9999 SCT090 00/M01 A3052 RMK AO2 SLP378 T10031013";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "ETEB");
    assert.deepStrictEqual(result.wind.degrees, 260);
    assert.deepStrictEqual(result.wind.speed_kts, 10);
    assert.deepStrictEqual(result.wind.gust_kts, null);
    assert.deepStrictEqual(result.visibility.meters, "10000");
    assert.deepStrictEqual(result.visibility.meters_float, 9999);
    //   ["clouds", [{ base_feet_agl: 9000, code: "SCT" }]],
    assert.deepStrictEqual(result.temperature.celsius, 0);
    assert.deepStrictEqual(result.temperature.fahrenheit, 32);
    assert.deepStrictEqual(result.barometer.kpa, 3052 / 10 / 2.9529988);
    assert.deepStrictEqual(result.flight_category, "VFR");
}
{
    // https://aviationweather.gov/metar/#3
    const metar = "KEYW 050653Z AUTO 19006KT FEW024 BKN039 26/23 A3000 RMK AO2 LTG DSNT W SLP159 T02610228";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "KEYW");
    assert.deepStrictEqual(result.wind.degrees, 190);
    assert.deepStrictEqual(result.wind.speed_kts, 6);
    assert.deepStrictEqual(result.wind.gust_kts, null);
    //   [
    //     "clouds",
    //     [
    //       { base_feet_agl: 2400, code: "FEW" },
    //       { base_feet_agl: 3900, code: "BKN" },
    //     ],
    //   ],
    assert.deepStrictEqual(result.temperature.celsius, 26);
    assert.deepStrictEqual(result.barometer.kpa, 3000 / 10 / 2.9529988);
    assert.deepStrictEqual(result.flight_category, "VFR");
}
{
    // https://api.checkwx.com/#2019-01-07
    const metar = "KSFO 070121Z 19023KT 1 1/2SM R28R/6000VP6000FT -RA BKN004 BKN013 OVC035 15/12 A2970 RMK AO2 T01500122 PNO $";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "KSFO");
    //   ["conditions", [{ code: "-" }, { code: "RA" }]],
    assert.deepStrictEqual(result.visibility.meters, "2500");
    assert.deepStrictEqual(result.visibility.meters_float, convert.milesToMeters(1.5));
    assert.deepStrictEqual(result.temperature.celsius, 15);
    assert.deepStrictEqual(result.temperature.fahrenheit, 59);
    //   ["dewpoint", { celsius: 12assert.deepStrictEqual(result.temperature.fahrenheit, 53.6 ],
    assert.deepStrictEqual(result.barometer.kpa, 2970 / 10 / 2.9529988);
    assert.deepStrictEqual(result.barometer.mb, 2970 / 2.9529988);
    assert.deepStrictEqual(result.flight_category, "LIFR");
}
{
    // EHAM with CAVOK
    const metar = "EHAM 100125Z 33004KT CAVOK M00/M01 Q1026 NOSIG";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "EHAM");
    assert.deepStrictEqual(result.visibility.miles_float, 10);
    assert.deepStrictEqual(result.visibility.meters, "16000");
    assert.deepStrictEqual(result.visibility.meters_float, convert.milesToMeters(10));
    assert.deepStrictEqual(result.temperature.celsius, -0);
    assert.deepStrictEqual(result.temperature.fahrenheit, 32);
    //   ["dewpoint", { celsius: -1assert.deepStrictEqual(result.temperature.fahrenheit, 30.2 ],
    assert.deepStrictEqual(result.barometer.kpa, 102.6);
    assert.deepStrictEqual(result.flight_category, "VFR");
}
{
    // Without VIS because it is CLR
    const metar = "KEYW 291553Z VRB03KT CLR 17/09 A3009 RMK AO2 SLP189 T01670089 $";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "KEYW");
    assert.deepStrictEqual(result.visibility.miles_float, 10);
    assert.deepStrictEqual(result.visibility.meters, "16000");
    assert.deepStrictEqual(result.visibility.meters_float, convert.milesToMeters(10));
    assert.deepStrictEqual(result.wind.degrees, 180);
    assert.deepStrictEqual(result.wind.speed_kts, 3);
    assert.deepStrictEqual(result.wind.gust_kts, null);
    assert.deepStrictEqual(result.temperature.celsius, 17);
    assert.deepStrictEqual(result.dewpoint.celsius, 9);
    assert.deepStrictEqual(result.flight_category, "VFR");
}
{
    // AUTO does stuff?
    const metar = "KDVO 022335Z AUTO 4SM BR BKN007 BKN013 12/12 A2988 RMK AO2";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "KDVO");
    assert.deepStrictEqual(result.visibility.miles_float, 4);
    assert.deepStrictEqual(result.visibility.meters, "6500");
    assert.deepStrictEqual(result.visibility.meters_float, convert.milesToMeters(4));
}
{
    const metar = "LFMK 151400Z AUTO 06007KT 030V100 CAVOK ///// Q1017 NOSIG=";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "LFMK");
    assert.deepStrictEqual(result.barometer.mb, 1017);
}
{
    const metar = "LFMK 211130Z AUTO 29005KT 260V320 9999 OVC034 24/20 Q1011=";
    console.log(metar);
    const result = metarParser(metar);
    assert.deepStrictEqual(result.icao, "LFMK");
    assert.deepStrictEqual(result.barometer.mb, 1011);
}
