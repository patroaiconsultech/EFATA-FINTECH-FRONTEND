import React, { useEffect, useState } from "react";
import { finishOidcLogin } from "../lib/auth.js";
import { navigate } from "../lib/navigation.js";
import { ErrorNotice, Loading, Panel } from "../components/UI.jsx";

export default function OidcCallback() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    if (!code || !state) {
      setError(new Error("Callback OIDC incompleto."));
      return;
    }
    finishOidcLogin(code, state)
      .then(() => navigate("/app/dashboard", true))
      .catch(setError);
  }, []);

  return (
    <main className="login-shell one-column">
      <Panel title="Concluindo autenticação">
        {error ? <ErrorNotice error={error} /> : <Loading label="Validando authorization code…" />}
      </Panel>
    </main>
  );
}
