import test from "node:test";
import assert from "node:assert/strict";
import { formatMoney, humanize, parseJson, safeNumber, shortId, toTags } from "../src/lib/format.js";

test("formatMoney formats BRL", () => {
  assert.match(formatMoney(1234.56, "BRL"), /1\.234,56/);
});

test("toTags trims and drops empty values", () => {
  assert.deepEqual(toTags(" SP, RJ, , MG "), ["SP", "RJ", "MG"]);
});

test("parseJson validates input", () => {
  assert.deepEqual(parseJson('{"a":1}'), { a: 1 });
  assert.throws(() => parseJson("{invalid}"));
});

test("shortId preserves short values and abbreviates UUIDs", () => {
  assert.equal(shortId("abc"), "abc");
  assert.match(shortId("00000000-0000-0000-0000-000000000003"), /…/);
});

test("humanize maps enum-like values", () => {
  assert.equal(humanize("APPROVED_TO_CONTACT"), "Approved to contact");
});

test("safeNumber handles invalid input", () => {
  assert.equal(safeNumber("12.5"), 12.5);
  assert.equal(safeNumber("x", 7), 7);
});
