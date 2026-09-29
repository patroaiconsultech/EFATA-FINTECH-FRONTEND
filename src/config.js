const viteEnv = import.meta.env || {};
const runtimeOrigin =
  typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : "http://localhost:5173";

function env(name, fallback = "") {
  const value = viteEnv[name];
  return value === undefined || value === null || value === "" ? fallback : value;
}

export const config = {
  appEnv: env("VITE_APP_ENV", "development"),
  apiBaseUrl: env("VITE_API_BASE_URL", "http://localhost:8000").replace(/\/$/, ""),
  authMode: env("VITE_AUTH_MODE", "mock"),
  brandName: env("VITE_BRAND_NAME", "Efatà 777"),
  buildRef: env("VITE_BUILD_REF", "local"),
  mockUserId: env("VITE_MOCK_USER_ID"),
  mockTenantId: env("VITE_MOCK_TENANT_ID"),
  oidcPkceTtlMs: Number(env("VITE_OIDC_PKCE_TTL_MS", "600000")),
  oidc: {
    authorizationEndpoint: env("VITE_OIDC_AUTHORIZATION_ENDPOINT"),
    tokenEndpoint: env("VITE_OIDC_TOKEN_ENDPOINT"),
    clientId: env("VITE_OIDC_CLIENT_ID"),
    redirectUri: env("VITE_OIDC_REDIRECT_URI", `${runtimeOrigin}/auth/callback`),
    scope: env("VITE_OIDC_SCOPE", "openid profile email"),
  },
};

export const INTERNAL_ROLES = new Set([
  "ANALYST",
  "PLATFORM_ADMIN",
  "INTERNAL_AGENT",
  "CREDIT_ANALYST",
]);

export const BORROWER_ROLES = new Set([
  "ORIGINATOR_ADMIN",
  "CLIENT_ADMIN",
  "BORROWER_ADMIN",
  "BORROWER_EDITOR",
]);

export const FUNDER_ROLES = new Set([
  "FUNDER_ADMIN",
  "FUNDER_EDITOR",
  "INVESTOR_ANALYST",
]);

export const PARTNER_ROLES = new Set(["PARTNER_ADMIN", "PARTNER_EDITOR"]);

export function isInternal(role) {
  return INTERNAL_ROLES.has(role);
}
