import test from "node:test";
import assert from "node:assert/strict";
import { canSee } from "../src/lib/permissions.js";

test("internal-only navigation excludes borrower/funder/partner roles", () => {
  assert.equal(canSee("ANALYST", "internal"), true);
  assert.equal(canSee("CLIENT_ADMIN", "internal"), false);
  assert.equal(canSee("FUNDER_ADMIN", "internal"), false);
  assert.equal(canSee("PARTNER_ADMIN", "internal"), false);
});

test("analyst actions are limited to ANALYST/PLATFORM_ADMIN", () => {
  assert.equal(canSee("ANALYST", "analyst"), true);
  assert.equal(canSee("PLATFORM_ADMIN", "analyst"), true);
  assert.equal(canSee("CREDIT_ANALYST", "analyst"), false);
});

test("client authorizer is exactly CLIENT_ADMIN", () => {
  assert.equal(canSee("CLIENT_ADMIN", "client-authorizer"), true);
  assert.equal(canSee("ORIGINATOR_ADMIN", "client-authorizer"), false);
});
