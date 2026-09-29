# SECURITY NOTES

- Mock auth é bloqueado pelo frontend quando `VITE_APP_ENV=production`.
- Mock auth continua sendo apenas conveniência local/test; o backend também o bloqueia fora de local/test.
- Access token fica em `sessionStorage`, não `localStorage`.
- OIDC usa Authorization Code + PKCE.
- O frontend não contém client secret.
- Secrets de ERP não são reexibidos após submit.
- Nenhum payload de negócio é persistido em `localStorage`.
- O client HTTP não registra bearer token, secret ERP nem payload em trace.
- Tenant e role efetivos vêm de `/api/v1/me`.
- UI role-aware melhora UX, mas não substitui autorização backend.
- Request IDs e correlation IDs são exibidos apenas como diagnóstico.
- O servidor estático adiciona CSP, frame denial, referrer policy e nosniff.
