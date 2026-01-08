import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { convert } from "./convert.js";

describe("Conversion Tests", () => {
  it("should convert temperature units correctly", () => {
    const fahrenheit = convert.celsiusToFahrenheit(1);
    assert.ok(fahrenheit > 33.75);
    assert.ok(fahrenheit < 33.85);
  });

  it("should convert pressure units correctly", () => {
    const hgin = convert.kpaToInhg(1);
    assert.ok(hgin > 0.29);
    assert.ok(hgin < 0.3);
  });

  it("should convert pressure units correctly", () => {
    const kpa = convert.inhgToKpa(1);
    assert.ok(kpa > 3.38);
    assert.ok(kpa < 3.39);
  });

  it("should convert distance units correctly", () => {
    const meters = convert.milesToMeters(1);
    assert.ok(meters > 1609);
    assert.ok(meters < 1610);
  });

  it("should convert speed units correctly", () => {
    const mps = convert.kphToMps(1);
    assert.ok(mps > 0.277);
    assert.ok(mps < 0.278);
  });

  it("should convert nautical speed units correctly", () => {
    const kts = convert.mpsToKts(1);
    assert.ok(kts > 1.94);
    assert.ok(kts < 1.95);
  });

  it("should convert back nautical speed units correctly", () => {
    const mps = convert.ktsToMps(1);
    assert.ok(mps > 0.51);
    assert.ok(mps < 0.52);
  });
});
