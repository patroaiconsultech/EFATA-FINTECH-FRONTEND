# Efatà 777 — Frontend Rebuild R1

Frontend reconstruído sobre o backend FastAPI atual da Efatà 777, aproveitando apenas padrões visuais e de deploy dos frontends legados que ainda eram úteis.

## Baseline física

```text
backend_zip=patroaiconsultech-EFATA_FINTECH_BACKEND-main (1).zip
backend_sha256=3f577e7a138fbbff7095d17a0fd9f3f55c461948b37a5334202442deb2cf152b

legacy_reactfix_sha256=31305a0979fd763793c1e9829cc33fb0af3558fada6c539b9dd762900334db69
legacy_completo_sha256=b1766da674fc33c18b216f3a3ef3226d85a985c5cb2feca62a5089f7f1e747b8
legacy_mvp_sha256=48a37932beb005137ec41e5f7ccb4a47960df7d89e6867758f676a358855eb14
```

## Decisão arquitetural

O frontend antigo **não foi promovido como baseline funcional** porque persistia negócio em `localStorage`, tentava endpoints que não existem no backend atual e possuía fallback local que poderia mascarar falha de integração.

Foram reaproveitados:
- estrutura React + Vite standalone;
- servidor estático SPA;
- padrões visuais de cards/pipeline;
- ideia de jornada operacional;
- responsividade básica.

Foram removidos:
- branding Fintegra/Orkio;
- `/api/chat/stream`;
- `/api/fintech/leads`;
- `/api/enterprise/leads`;
- persistência de leads/pipeline/chat em `localStorage`;
- fallback que declarava sucesso local quando a API falhava.

## O que o R1 entrega

- Efatà 777 como marca canônica;
- landing institucional;
- autenticação mock local/test;
- OIDC Authorization Code + PKCE configurável;
- modo bearer apenas para integração controlada;
- `/api/v1/me` como contexto canônico;
- request/correlation IDs;
- dashboard role-aware;
- leads;
- representações;
- oportunidades + documentos + qualificação `If-Match`;
- marketplace;
- risk simulator + governance queue;
- viabilidade + cenários + cálculo + sensibilidade + snapshot;
- ERP SIENGE/MEGA;
- consent ledger;
- reconciliação persistente;
- review queue;
- outbox;
- system/health/tracing.

## Rodar localmente

```bash
cp .env.example .env
npm install
npm run dev
```

Backend:

```text
http://localhost:8000
```

Frontend:

```text
http://localhost:5173
```

No backend local/test:

```env
FINTECH_CORS_ALLOWED_ORIGINS=http://localhost:5173
FINTECH_AUTH_PROVIDER=mock
```

## Verificação local executada nesta construção

```text
static-check=PASS
node:test=6/6 PASS
JSX_PARSE(TypeScript parser, noResolve)=PASS
npm_build=NOT_PROVEN_IN_AUTHORING_ENVIRONMENT
```

O build não foi executado neste ambiente porque as dependências npm não estavam em cache e acesso ao registry não ficou disponível. Execute `npm install && npm run check` no ambiente de implantação antes de promover.

## Produção

Este frontend não transforma o backend em production-ready. O incidente conhecido da migration `MIG-0009-DOWNGRADE-001` permanece fora deste patch e continua sendo um gate backend separado.


## R1.1 qualification gate

R1.1 adds focused API/auth/tenant/If-Match/error tests, OIDC PKCE expiration, and premium contract documentation.

Canonical connected qualification:

```bash
./scripts/freeze-lockfile.sh
./scripts/qualify-r1.1.sh
```

The package is **not deploy-qualified** until `package-lock.json`, `npm ci`, and `npm run build` are proven in a connected clean environment.
