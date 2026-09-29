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

const { config } = await import("../src/config.js");
const { setMockIdentity } = await import("../src/lib/auth.js");
const {
  ApiClientError,
  apiRequest,
  buildIfMatchHeader,
  getCurrentIdentity,
} = await import("../src/lib/api.js");

function resetConfig() {
  config.appEnv = "test";
  config.authMode = "mock";
  config.apiBaseUrl = "http://api.test";
  sessionStorage.clear();
  setMockIdentity({ userId: "user-1", tenantId: "tenant-1" });
}

test("apiRequest sends auth, request and correlation IDs and consumes response trace IDs", async () => {
  resetConfig();
  let captured;
  globalThis.fetch = async (url, init) => {
    captured = { url: String(url), init };
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "X-Request-ID": "server-request",
        "X-Correlation-ID": "server-correlation",
        "X-Duration-Ms": "9",
      },
    });
  };

  const result = await apiRequest("/api/v1/health/ready", {
    correlationId: "client-correlation",
  });

  assert.equal(captured.init.headers["X-User-ID"], "user-1");
  assert.equal(captured.init.headers["X-Tenant-ID"], "tenant-1");
  assert.match(captured.init.headers["X-Request-ID"], /^[0-9a-f-]{36}$/i);
  assert.equal(captured.init.headers["X-Correlation-ID"], "client-correlation");
  assert.equal(result.trace.requestId, "server-request");
  assert.equal(result.trace.correlationId, "server-correlation");
  assert.equal(result.trace.durationMs, 9);
});

test("apiRequest preserves canonical error envelope", async () => {
  resetConfig();
  globalThis.fetch = async () =>
    new Response(JSON.stringify({
      data: null,
      meta: { request_id: "req-422", correlation_id: "corr-422" },
      error: {
        code: "VALIDATION_ERROR",
        message: "Payload inválido.",
        details: [{ field: "x" }],
      },
    }), {
      status: 422,
      headers: { "content-type": "application/json" },
    });

  await assert.rejects(
    () => apiRequest("/api/v1/leads", { method: "POST", body: {} }),
    (error) => {
      assert.ok(error instanceof ApiClientError);
      assert.equal(error.status, 422);
      assert.equal(error.code, "VALIDATION_ERROR");
      assert.equal(error.requestId, "req-422");
      assert.equal(error.correlationId, "corr-422");
      assert.deepEqual(error.details, [{ field: "x" }]);
      return true;
    },
  );
});

test("apiRequest converts fetch failures to NETWORK_ERROR without fake success", async () => {
  resetConfig();
  globalThis.fetch = async () => { throw new Error("offline"); };
  await assert.rejects(
    () => apiRequest("/api/v1/me"),
    (error) => error instanceof ApiClientError && error.code === "NETWORK_ERROR",
  );
});

test("getCurrentIdentity calls canonical /api/v1/me", async () => {
  resetConfig();
  let requested = "";
  globalThis.fetch = async (url) => {
    requested = new URL(url).pathname;
    return new Response(JSON.stringify({
      user_id: "user-1",
      tenant_id: "tenant-1",
      membership_id: "member-1",
      role: "ANALYST",
    }), { status: 200, headers: { "content-type": "application/json" } });
  };
  const me = await getCurrentIdentity();
  assert.equal(requested, "/api/v1/me");
  assert.equal(me.tenant_id, "tenant-1");
  assert.equal(me.role, "ANALYST");
});

test("buildIfMatchHeader quotes a version and rejects empty versions", () => {
  assert.deepEqual(buildIfMatchHeader(7), { "If-Match": '"7"' });
  assert.deepEqual(buildIfMatchHeader('"8"'), { "If-Match": '"8"' });
  assert.throws(() => buildIfMatchHeader(""), /Versão obrigatória/);
});
