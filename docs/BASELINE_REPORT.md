# BASELINE REPORT — EFATÀ 777 FRONTEND REBUILD R1

## Artefatos inspecionados

| Artefato | SHA-256 | Papel |
|---|---|---|
| Backend atual | `3f577e7a138fbbff7095d17a0fd9f3f55c461948b37a5334202442deb2cf152b` | Fonte da verdade de APIs |
| Frontend completo reactfix | `31305a0979fd763793c1e9829cc33fb0af3558fada6c539b9dd762900334db69` | Legado visual/runtime |
| Frontend completo | `b1766da674fc33c18b216f3a3ef3226d85a985c5cb2feca62a5089f7f1e747b8` | Legado anterior ao reactfix |
| Frontend MVP patch | `48a37932beb005137ec41e5f7ccb4a47960df7d89e6867758f676a358855eb14` | Patch parcial histórico |

## Backend

```text
zip_entries=144
router_endpoints=67
framework=FastAPI
api_prefix=/api/v1
frontend_in_backend=ABSENT
```

### Estado conhecido

O backend atual contém:
- auth mock local/test;
- auth OIDC por bearer token;
- multi-tenancy por membership local;
- request/correlation middleware;
- CORS configurável;
- marketplace;
- risk/governance;
- viability;
- ERP;
- consent;
- persistent reconciliation.

### Gap crítico fora do frontend

`migrations/versions/0009_sync_job_study_link_r11.py` do ZIP analisado ainda contém o downgrade histórico que depende do nome fixo `fk_sync_job_study`.

```text
MIG_0009_DOWNGRADE_001=OPEN
BACKEND_MIGRATION_GATE=NO-GO
```

O frontend R1 não altera migrations.

## Provenance

Não existe `.git` no ZIP analisado. Logo:

```text
backend_branch=NOT_PROVEN
backend_commit=NOT_PROVEN
deployed_backend_commit=NOT_PROVEN
frontend_commit=NOT_PROVEN
production_runtime=NOT_PROVEN
```

A baseline física desta entrega é o SHA-256 do ZIP, não um commit inferido.
