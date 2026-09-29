# FRONTEND ARCHITECTURE — R1.1

## Runtime shape

```text
Browser
→ React SPA
→ src/lib/api.js
→ /api/v1/*
→ FastAPI baseline
```

No business persistence is performed in localStorage. Session-scoped auth material uses `sessionStorage`.

## Identity

```text
DEV mock:
X-User-ID + X-Tenant-ID
blocked when VITE_APP_ENV=production

OIDC:
Authorization Code + PKCE
Bearer access token in sessionStorage
PKCE state/verifier TTL = VITE_OIDC_PKCE_TTL_MS (default 10 min)
```

`GET /api/v1/me` is the canonical runtime identity/tenant/role bootstrap.

## Tenant boundary

The browser never invents production tenant membership. Tenant/role come from `/api/v1/me`.
Mock tenant switching is DEV-only. Backend remains the authorization boundary.

## API boundary

`src/lib/api.js` centralizes:
- Base URL
- authentication headers
- X-Request-ID
- X-Correlation-ID
- error envelope
- network failure
- trace buffer
- If-Match header helper

No fake success fallback exists.

## Rendering

`Shell.jsx` filters navigation through `canSee(role, scope)`.
Backend permissions remain authoritative.

## Build

Vite builds the SPA. Production serving uses `server.js`, not the Vite dev server.

## Current evidence classification

```text
SOURCE=PROPOSAL_R1_1
STATIC_CHECK=LOCAL
UNIT/FOCAL_TESTS=LOCAL
LOCKFILE=PENDING_CONNECTED_GATE
NPM_CI=PENDING
BUILD=PENDING
INTEGRATED_RUNTIME=PENDING
```
