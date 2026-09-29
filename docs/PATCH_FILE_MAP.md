# PATCH FILE MAP

## Novo frontend standalone

Todos os arquivos desta entrega são novos em relação ao backend atual.

```text
package.json
index.html
vite.config.js
server.js
railway.json
.env.example
src/**
tests/**
scripts/**
docs/**
```

## Backend

Nenhum arquivo de código backend é substituído.

Aplicação:
1. criar/repositório frontend separado;
2. copiar todos os arquivos deste pacote;
3. configurar variáveis frontend;
4. configurar CORS no backend;
5. build/smoke;
6. só depois promover frontend.

Não copiar `src/` do frontend para dentro de `app/` do FastAPI.
