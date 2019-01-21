'use strict';

const assert      = require('assert');

const convert = require('../lib/convert');

describe('convert', function() {

  it('must convert celsius in fahrenheit', function() {
    const fahrenheit = convert.celsiusToFahrenheit(1);
    //console.log(fahrenheit);
    assert.ok(fahrenheit > 33.75);
    assert.ok(fahrenheit < 33.85);
  });

  it('must convert kpa in hgin', function() {
    const hgin = convert.kpaToInhg(1);
    // console.log(hgin);
    assert.ok(hgin > 0.29);
    assert.ok(hgin < 0.30);
  });

  it('must convert hgin in kpa', function() {
    const kpa = convert.inhgToKpa(1);
    //console.log(kpa);
    assert.ok(kpa > 3.38);
    assert.ok(kpa < 3.39);
  });

  it('must convert miles in meters', function() {
    const meters = convert.milesToMeters(1);
    //console.log(meters);
    assert.ok(meters > 1609);
    assert.ok(meters < 1610);
  });

  it('must convert km/h in m/s', function() {
    const mps = convert.kphToMps(1);
    //console.log(mps);
    assert.ok(mps > 0.277);
    assert.ok(mps < 0.278);
  });

  it('must convert m/s to kts', function() {
    const kts = convert.mpsToKts(1);
    //console.log(kts);
    assert.ok(kts > 1.94);
    assert.ok(kts < 1.95);
  });

  it('must convert kts to m/s', function() {
    const mps = convert.ktsToMps(1);
    //console.log(mps);
    assert.ok(mps > 0.51);
    assert.ok(mps < 0.52);
  });
});
