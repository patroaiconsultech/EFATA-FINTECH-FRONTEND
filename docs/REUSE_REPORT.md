# REUSE REPORT — FRONTENDS LEGADOS

## 1. `orkio-fintech-frontend-completo-reactfix-main.zip`

Foi o legado mais útil.

### Reaproveitado conceitualmente
- React 18 + Vite;
- servidor standalone com SPA fallback;
- layout escuro B2B;
- cards de agentes;
- composição de console;
- responsividade;
- deploy Railway simples.

### Não reaproveitado como contrato
O `fintechApi.js` antigo:
- salvava lead/pipeline/chat em `localStorage`;
- tentava endpoints fora da superfície atual;
- possuía fallback local;
- usava `/api/chat/stream`, ausente no backend Efatà Fintech atual.

Essas partes foram removidas.

## 2. `orkio-fintech-frontend-completo-main.zip`

É quase idêntico ao reactfix. O reactfix difere principalmente pela importação explícita de `React` e versão `1.0.1`.

Nenhum valor funcional adicional justificou usá-lo como baseline.

## 3. `orkio-fintech-frontend-mvp-main.zip`

É um patch parcial, não uma aplicação standalone completa.

Foi útil apenas para confirmar a intenção histórica:
- landing fintech;
- onboarding;
- pipeline;
- console.

Não foi reutilizado como runtime.

## Resultado

```text
LEGACY_VISUAL_PATTERNS=REUSED_SELECTIVELY
LEGACY_API_CONTRACTS=REJECTED
LEGACY_LOCAL_FAKE_PERSISTENCE=REMOVED
CANONICAL_BACKEND_API=/api/v1
CANONICAL_BRAND=EFATÀ 777
```
