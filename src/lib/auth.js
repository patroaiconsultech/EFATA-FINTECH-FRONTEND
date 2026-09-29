import { config } from "../config.js";

const TOKEN_KEY = "efata.access_token";
const MOCK_KEY = "efata.mock_identity";
const PKCE_KEY = "efata.oidc.pkce";

export const demoIdentities = [
  { label: "Originador Demo", role: "ORIGINATOR_ADMIN", userId: "20000000-0000-0000-0000-000000000001", tenantId: "00000000-0000-0000-0000-000000000001" },
  { label: "Cliente Demo", role: "CLIENT_ADMIN", userId: "20000000-0000-0000-0000-000000000002", tenantId: "00000000-0000-0000-0000-000000000002" },
  { label: "Analista Demo", role: "ANALYST", userId: "20000000-0000-0000-0000-000000000003", tenantId: "00000000-0000-0000-0000-000000000003" },
  { label: "Funder Demo", role: "FUNDER_ADMIN", userId: "20000000-0000-0000-0000-000000000004", tenantId: "00000000-0000-0000-0000-000000000004" },
  { label: "Parceiro Demo", role: "PARTNER_ADMIN", userId: "20000000-0000-0000-0000-000000000005", tenantId: "00000000-0000-0000-0000-000000000005" },
];

function base64Url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function randomString(size = 48) {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return base64Url(bytes);
}

async function sha256(text) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
}

function clearPkce() {
  sessionStorage.removeItem(PKCE_KEY);
}

export function getMockIdentity() {
  const raw = sessionStorage.getItem(MOCK_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  return config.mockUserId && config.mockTenantId
    ? { userId: config.mockUserId, tenantId: config.mockTenantId }
    : null;
}

export function setMockIdentity(identity) {
  sessionStorage.setItem(MOCK_KEY, JSON.stringify(identity));
}

export function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

export function setAccessToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export function clearAuth() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(MOCK_KEY);
  clearPkce();
}

export function hasCredential() {
  if (config.authMode === "mock") return Boolean(getMockIdentity());
  return Boolean(getAccessToken());
}

export function getAuthHeaders() {
  if (config.authMode === "mock") {
    if (config.appEnv === "production") {
      throw new Error("VITE_AUTH_MODE=mock é bloqueado em produção.");
    }
    const identity = getMockIdentity();
    if (!identity?.userId || !identity?.tenantId) return {};
    return {
      "X-User-ID": identity.userId,
      "X-Tenant-ID": identity.tenantId,
    };
  }

  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function beginOidcLogin() {
  const { authorizationEndpoint, clientId, redirectUri, scope } = config.oidc;
  if (!authorizationEndpoint || !clientId || !redirectUri) {
    throw new Error("OIDC não está configurado no frontend.");
  }

  const verifier = randomString(64);
  const challenge = base64Url(await sha256(verifier));
  const state = randomString(32);
  sessionStorage.setItem(
    PKCE_KEY,
    JSON.stringify({ verifier, state, createdAt: Date.now() }),
  );

  const url = new URL(authorizationEndpoint);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  window.location.assign(url.toString());
}

export async function finishOidcLogin(code, state) {
  let saved = null;
  try {
    saved = JSON.parse(sessionStorage.getItem(PKCE_KEY) || "null");
  } catch {
    clearPkce();
    throw new Error("Estado OIDC inválido ou expirado.");
  }

  const ageMs = saved?.createdAt ? Date.now() - Number(saved.createdAt) : Number.POSITIVE_INFINITY;
  const invalid =
    !saved?.verifier ||
    !saved?.state ||
    saved.state !== state ||
    !Number.isFinite(ageMs) ||
    ageMs < 0 ||
    ageMs > config.oidcPkceTtlMs;

  if (invalid) {
    clearPkce();
    throw new Error("Estado OIDC inválido ou expirado.");
  }

  const { tokenEndpoint, clientId, redirectUri } = config.oidc;
  if (!tokenEndpoint || !clientId) {
    clearPkce();
    throw new Error("Token endpoint OIDC não configurado.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
    code_verifier: saved.verifier,
  });

  let response;
  try {
    response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch {
    clearPkce();
    throw new Error("Falha de rede ao trocar authorization code.");
  }

  if (!response.ok) {
    clearPkce();
    throw new Error(`Falha ao trocar authorization code (${response.status}).`);
  }

  const payload = await response.json();
  if (!payload.access_token) {
    clearPkce();
    throw new Error("IdP não retornou access_token.");
  }

  setAccessToken(payload.access_token);
  clearPkce();
  return payload;
}
