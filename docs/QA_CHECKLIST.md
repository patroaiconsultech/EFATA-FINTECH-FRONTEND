# QA CHECKLIST

## Build
- [ ] `npm install`
- [ ] `npm run static-check`
- [ ] `npm test`
- [ ] `npm run build`

## Auth
- [ ] mock local/test
- [ ] mock bloqueado em production
- [ ] OIDC PKCE
- [ ] logout limpa sessão
- [ ] `/api/v1/me` define role/tenant

## Tenant
- [ ] Originador não vê tenant alheio
- [ ] Cliente não vê tenant alheio
- [ ] Funder respeita escopo de matches
- [ ] Parceiro respeita atribuição
- [ ] troca de sessão não preserva dados de negócio em storage

## HTTP
- [ ] 401 tratado
- [ ] 403 tratado
- [ ] 404 tratado
- [ ] 409 tratado
- [ ] 422 tratado
- [ ] 5xx tratado
- [ ] request_id preservado
- [ ] correlation_id preservado

## Módulos
- [ ] Leads
- [ ] Representações
- [ ] Oportunidades
- [ ] Marketplace
- [ ] Risk
- [ ] Governance
- [ ] Viability
- [ ] ERP
- [ ] Consent
- [ ] Reconciliation
- [ ] Outbox
- [ ] System

## Production gate
- [ ] MIG-0009 resolvido
- [ ] backend PostgreSQL gate verde
- [ ] frontend build verde
- [ ] integrated smoke verde
