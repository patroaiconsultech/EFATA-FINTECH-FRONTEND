import test from "node:test";
import assert from "node:assert/strict";

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  clear() { this.map.clear(); }
}

globalThis.sessionStorage = new MemoryStorage();
if (!globalThis.btoa) {
  globalThis.btoa = (value) => Buffer.from(value, "binary").toString("base64");
}

const { config } = await import("../src/config.js");
const {
  beginOidcLogin,
  finishOidcLogin,
  getAccessToken,
  getAuthHeaders,
  setMockIdentity,
} = await import("../src/lib/auth.js");

function configureOidc() {
  config.authMode = "oidc";
  config.appEnv = "test";
  config.oidc.authorizationEndpoint = "https://idp.test/authorize";
  config.oidc.tokenEndpoint = "https://idp.test/token";
  config.oidc.clientId = "public-spa";
  config.oidc.redirectUri = "https://app.test/auth/callback";
  config.oidc.scope = "openid profile email";
  config.oidcPkceTtlMs = 600000;
}

test("mock auth carries tenant/user headers outside production", () => {
  sessionStorage.clear();
  config.authMode = "mock";
  config.appEnv = "test";
  setMockIdentity({ userId: "u-1", tenantId: "t-1" });
  assert.deepEqual(getAuthHeaders(), {
    "X-User-ID": "u-1",
    "X-Tenant-ID": "t-1",
  });
});

test("mock auth is blocked in production", () => {
  sessionStorage.clear();
  config.authMode = "mock";
  config.appEnv = "production";
  setMockIdentity({ userId: "u-1", tenantId: "t-1" });
  assert.throws(() => getAuthHeaders(), /bloqueado em produção/);
});

test("OIDC begin creates state, verifier, timestamp and S256 challenge", async () => {
  sessionStorage.clear();
  configureOidc();
  let assigned = "";
  globalThis.window = {
    location: { assign(value) { assigned = value; } },
  };

  await beginOidcLogin();

  const pkce = JSON.parse(sessionStorage.getItem("efata.oidc.pkce"));
  assert.ok(pkce.verifier);
  assert.ok(pkce.state);
  assert.ok(Number.isFinite(pkce.createdAt));

  const url = new URL(assigned);
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("client_id"), "public-spa");
  assert.equal(url.searchParams.get("state"), pkce.state);
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.ok(url.searchParams.get("code_challenge"));
});

test("OIDC callback rejects expired PKCE and clears material", async () => {
  sessionStorage.clear();
  configureOidc();
  sessionStorage.setItem("efata.oidc.pkce", JSON.stringify({
    verifier: "v",
    state: "s",
    createdAt: Date.now() - config.oidcPkceTtlMs - 1,
  }));

  await assert.rejects(() => finishOidcLogin("code", "s"), /inválido ou expirado/);
  assert.equal(sessionStorage.getItem("efata.oidc.pkce"), null);
});

test("OIDC callback rejects state mismatch and clears material", async () => {
  sessionStorage.clear();
  configureOidc();
  sessionStorage.setItem("efata.oidc.pkce", JSON.stringify({
    verifier: "v",
    state: "expected",
    createdAt: Date.now(),
  }));

  await assert.rejects(
    () => finishOidcLogin("code", "unexpected"),
    /inválido ou expirado/,
  );
  assert.equal(sessionStorage.getItem("efata.oidc.pkce"), null);
});

test("OIDC callback exchanges code, stores bearer token and clears PKCE", async () => {
  sessionStorage.clear();
  configureOidc();
  sessionStorage.setItem("efata.oidc.pkce", JSON.stringify({
    verifier: "verifier",
    state: "state",
    createdAt: Date.now(),
  }));

  let request;
  globalThis.fetch = async (url, init) => {
    request = { url: String(url), init };
    return new Response(JSON.stringify({ access_token: "token-123" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  await finishOidcLogin("code-123", "state");

  assert.equal(request.url, "https://idp.test/token");
  assert.match(String(request.init.body), /code_verifier=verifier/);
  assert.equal(getAccessToken(), "token-123");
  assert.equal(sessionStorage.getItem("efata.oidc.pkce"), null);
  assert.deepEqual(getAuthHeaders(), { Authorization: "Bearer token-123" });
});
