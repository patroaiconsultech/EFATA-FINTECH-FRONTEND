# DEPLOYMENT

## Frontend Railway

Build:

```bash
npm install --no-audit --no-fund
npm run check
```

Start:

```bash
npm run start
```

Port:

```env
PORT=8080
```

## Frontend env

### Local/test

```env
VITE_APP_ENV=development
VITE_API_BASE_URL=https://<backend>
VITE_AUTH_MODE=mock
VITE_MOCK_USER_ID=...
VITE_MOCK_TENANT_ID=...
VITE_BUILD_REF=<frontend commit/tag>
```

### Production OIDC

```env
VITE_APP_ENV=production
VITE_API_BASE_URL=https://<backend>
VITE_AUTH_MODE=oidc
VITE_OIDC_AUTHORIZATION_ENDPOINT=https://<idp>/authorize
VITE_OIDC_TOKEN_ENDPOINT=https://<idp>/token
VITE_OIDC_CLIENT_ID=<public-spa-client-id>
VITE_OIDC_REDIRECT_URI=https://<frontend>/auth/callback
VITE_OIDC_SCOPE=openid profile email
VITE_BUILD_REF=<frontend commit/tag>
```

Não existe client secret no frontend.

## Backend env necessário

O backend já suporta CORS configurável. Não é necessário patch de código para integrar este frontend.

Ajustar:

```env
FINTECH_CORS_ALLOWED_ORIGINS=https://<frontend-domain>
```

Em ambiente compartilhado:

```env
FINTECH_AUTH_PROVIDER=oidc
```

A configuração completa do OIDC do backend continua sendo responsabilidade do backend/IdP.

## Smoke pós-deploy

1. `GET /api/v1/health/live`
2. `GET /api/v1/health/ready`
3. login
4. `GET /api/v1/me`
5. dashboard
6. role/tenant corretos
7. criar/listar recurso permitido
8. provocar 403 com role sem permissão
9. provocar 409 de `If-Match` controladamente
10. verificar request/correlation IDs
