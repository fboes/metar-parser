import { strict as assert } from "node:assert";
import { convert } from "./convert.js";
{
    const fahrenheit = convert.celsiusToFahrenheit(1);
    // console.log(fahrenheit);
    assert.ok(fahrenheit > 33.75);
    assert.ok(fahrenheit < 33.85);
}
{
    const hgin = convert.kpaToInhg(1);
    // console.log(hgin);
    assert.ok(hgin > 0.29);
    assert.ok(hgin < 0.3);
}
{
    const kpa = convert.inhgToKpa(1);
    // console.log(kpa);
    assert.ok(kpa > 3.38);
    assert.ok(kpa < 3.39);
}
{
    const meters = convert.milesToMeters(1);
    // console.log(meters);
    assert.ok(meters > 1609);
    assert.ok(meters < 1610);
}
{
    const mps = convert.kphToMps(1);
    // console.log(mps);
    assert.ok(mps > 0.277);
    assert.ok(mps < 0.278);
}
{
    const kts = convert.mpsToKts(1);
    // console.log(kts);
    assert.ok(kts > 1.94);
    assert.ok(kts < 1.95);
}
{
    const mps = convert.ktsToMps(1);
    // console.log(mps);
    assert.ok(mps > 0.51);
    assert.ok(mps < 0.52);
}
