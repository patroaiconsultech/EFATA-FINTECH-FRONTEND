import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Shell navigation is role-filtered through canSee", () => {
  const source = fs.readFileSync("src/components/Shell.jsx", "utf8");
  assert.match(source, /nav\.filter\(\(item\) => canSee\(me\.role, item\[2\]\)\)/);
});

test("Opportunity qualification uses centralized If-Match helper", () => {
  const source = fs.readFileSync("src/pages/Opportunities.jsx", "utf8");
  assert.match(source, /buildIfMatchHeader\(qualification\.version\)/);
  assert.doesNotMatch(source, /"If-Match":\s*`/);
});

test("App bootstraps canonical identity helper and does not invent tenant", () => {
  const source = fs.readFileSync("src/App.jsx", "utf8");
  assert.match(source, /getCurrentIdentity\(\)/);
  assert.doesNotMatch(source, /tenant_id\s*:/);
});
