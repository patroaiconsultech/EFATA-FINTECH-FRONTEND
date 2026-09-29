import React, { useMemo, useState } from "react";
import { config } from "../config.js";
import { beginOidcLogin, demoIdentities, setAccessToken, setMockIdentity } from "../lib/auth.js";
import { navigate } from "../lib/navigation.js";
import { Button, ErrorNotice, Field, Panel, Select, TextInput } from "../components/UI.jsx";

export default function Login() {
  const [selected, setSelected] = useState(2);
  const [token, setToken] = useState("");
  const [error, setError] = useState(null);
  const productionMockBlocked = config.appEnv === "production" && config.authMode === "mock";

  const modeLabel = useMemo(() => {
    if (config.authMode === "mock") return "Mock local/test";
    if (config.authMode === "oidc") return "OIDC + PKCE";
    return "Bearer integration";
  }, []);

  async function login() {
    setError(null);
    try {
      if (config.authMode === "mock") {
        if (productionMockBlocked) throw new Error("Mock auth não pode ser usado em produção.");
        const identity = demoIdentities[selected];
        setMockIdentity({ userId: identity.userId, tenantId: identity.tenantId });
        navigate("/app/dashboard");
        return;
      }
      if (config.authMode === "oidc") {
        await beginOidcLogin();
        return;
      }
      if (!token.trim()) throw new Error("Informe um access token para o modo bearer.");
      setAccessToken(token.trim());
      navigate("/app/dashboard");
    } catch (cause) {
      setError(cause);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-copy">
        <button className="brand" onClick={() => navigate("/")}>
          <span className="brand-mark">E</span>
          <span><strong>{config.brandName}</strong><small>Fintech Intelligence</small></span>
        </button>
        <p className="eyebrow">Acesso governado</p>
        <h1>Entre no contexto correto de usuário e tenant.</h1>
        <p>
          A role efetiva não é definida por esta tela. Após a autenticação, a plataforma consulta
          <code>/api/v1/me</code> e usa a membership local do backend como autoridade.
        </p>
      </section>

      <Panel title="Autenticação" subtitle={`Modo configurado: ${modeLabel}`} className="login-panel">
        <ErrorNotice error={error} />
        {config.authMode === "mock" ? (
          <>
            <div className="dev-banner">AMBIENTE DE DESENVOLVIMENTO — headers X-User-ID / X-Tenant-ID</div>
            <Field label="Identidade demo">
              <Select value={selected} onChange={(event) => setSelected(Number(event.target.value))}>
                {demoIdentities.map((identity, index) => (
                  <option key={identity.userId} value={index}>{identity.label} · {identity.role}</option>
                ))}
              </Select>
            </Field>
          </>
        ) : null}

        {config.authMode === "bearer" ? (
          <Field label="Access token" hint="Mantido somente em sessionStorage neste navegador.">
            <TextInput type="password" value={token} onChange={(event) => setToken(event.target.value)} autoComplete="off" />
          </Field>
        ) : null}

        {config.authMode === "oidc" ? (
          <p className="muted">O login usa Authorization Code + PKCE. Nenhum client secret é armazenado no frontend.</p>
        ) : null}

        <Button disabled={productionMockBlocked} onClick={login}>
          {config.authMode === "oidc" ? "Continuar com SSO" : "Entrar"}
        </Button>
      </Panel>
    </main>
  );
}
