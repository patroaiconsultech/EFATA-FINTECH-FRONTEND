# BACKEND GAP REPORT

Gaps identificados que o frontend **não mascara**.

## Gaps funcionais

1. Não existe `GET /api/v1/representations`.
   - A UI cria/aceita/revoga representação por ID conhecido.
   - Não inventa listagem local.

2. Não existe listagem geral de consent grants.
   - A UI emite/revoga/autoriza por ID conhecido e oferece integrity check.
   - Não mantém ledger paralelo no browser.

3. Não há endpoint agregado de dashboard.
   - O dashboard compõe contagens a partir dos GETs permitidos à role.

4. Documentos são registrados por metadata/checksum.
   - O frontend não presume upload multipart/storage binário.

5. OIDC depende de configuração externa do IdP.
   - O frontend fornece Authorization Code + PKCE configurável.
   - Nenhum client secret é colocado no bundle.

6. A superfície antiga de chat/agentes ORKIO não existe neste backend fintech.
   - O frontend reconstruído não chama `/api/chat/stream`.

## Gap de migration

```text
MIG_0009_DOWNGRADE_001=OPEN
```

A migration `0009_sync_job_study_link_r11.py` do artifact atual ainda possui o downgrade histórico com constraint nominal.

Esse gap:
- não impede desenvolvimento do frontend;
- impede afirmar `PRODUCTION_READY`;
- permanece fora do escopo deste frontend.

## APIs não expostas no R1

Alguns endpoints existentes não ganharam uma tela dedicada nesta primeira reconstrução:
- `GET /api/v1/leads/{lead_id}`;
- `GET /api/v1/opportunities/{opportunity_id}`;
- documentos de credit request (POST/GET);
- marketplace commission-events legado;
- avaliações persistidas de risk por credit request;
- reconciliação in-memory legada.

A matriz contratual registra cada caso explicitamente.
