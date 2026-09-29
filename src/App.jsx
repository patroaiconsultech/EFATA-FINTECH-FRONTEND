import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentIdentity } from "./lib/api.js";
import { hasCredential } from "./lib/auth.js";
import { currentPath, navigate } from "./lib/navigation.js";
import Shell from "./components/Shell.jsx";
import { ErrorNotice, Loading, Panel, Button } from "./components/UI.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import OidcCallback from "./pages/OidcCallback.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Leads from "./pages/Leads.jsx";
import Opportunities from "./pages/Opportunities.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import { GovernanceQueue, RiskSimulator } from "./pages/Risk.jsx";
import { ErpConnections, ViabilityStudies } from "./pages/Viability.jsx";
import Consent from "./pages/Consent.jsx";
import Reconciliation from "./pages/Reconciliation.jsx";
import System from "./pages/System.jsx";
import NotFound from "./pages/NotFound.jsx";

function usePath() {
  const [path, setPath] = useState(currentPath());
  useEffect(() => {
    const handler = () => setPath(currentPath());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);
  return path;
}

function AppRoute({ path, me }) {
  if (path === "/app/dashboard") return <Dashboard me={me} />;
  if (path === "/app/leads") return <Leads />;
  if (path === "/app/opportunities") return <Opportunities me={me} />;
  if (path.startsWith("/app/marketplace/")) return <Marketplace me={me} section={path.split("/").filter(Boolean).at(-1)} />;
  if (path === "/app/risk/simulator") return <RiskSimulator />;
  if (path === "/app/risk/governance") return <GovernanceQueue />;
  if (path === "/app/viability/studies") return <ViabilityStudies />;
  if (path === "/app/viability/erp") return <ErpConnections />;
  if (path === "/app/consent") return <Consent me={me} />;
  if (path.startsWith("/app/reconciliation/")) return <Reconciliation section={path.split("/").filter(Boolean).at(-1)} />;
  if (path === "/app/system") return <System me={me} />;
  return <NotFound />;
}

export default function App() {
  const path = usePath();
  const [identity, setIdentity] = useState({ loading: false, me: null, error: null });

  const publicRoute = path === "/" || path === "/login" || path === "/auth/callback";

  const loadIdentity = useCallback(async () => {
    if (!hasCredential()) {
      setIdentity({ loading: false, me: null, error: null });
      return null;
    }
    setIdentity((state) => ({ ...state, loading: true, error: null }));
    try {
      const me = await getCurrentIdentity();
      setIdentity({ loading: false, me, error: null });
      return me;
    } catch (error) {
      setIdentity({ loading: false, me: null, error });
      return null;
    }
  }, []);

  useEffect(() => {
    if (path.startsWith("/app/")) loadIdentity();
  }, [path, loadIdentity]);

  useEffect(() => {
    if (path === "/login" && hasCredential()) {
      loadIdentity().then((me) => me && navigate("/app/dashboard", true));
    }
  }, [path, loadIdentity]);

  if (path === "/") return <Landing />;
  if (path === "/login") return <Login />;
  if (path === "/auth/callback") return <OidcCallback />;

  if (!path.startsWith("/app/")) return <Landing />;

  if (!hasCredential()) {
    navigate("/login", true);
    return <Loading label="Redirecionando para autenticação…" />;
  }

  if (identity.loading && !identity.me) return <main className="boot-shell"><Loading label="Carregando contexto do tenant…" /></main>;

  if (identity.error && !identity.me) {
    return (
      <main className="boot-shell">
        <Panel title="Não foi possível abrir o workspace">
          <ErrorNotice error={identity.error} />
          <div className="button-row">
            <Button onClick={loadIdentity}>Tentar novamente</Button>
            <Button variant="secondary" onClick={() => navigate("/login")}>Voltar ao login</Button>
          </div>
        </Panel>
      </main>
    );
  }

  if (!identity.me) return <main className="boot-shell"><Loading /></main>;

  return (
    <Shell me={identity.me} path={path} onReloadIdentity={loadIdentity}>
      <AppRoute path={path} me={identity.me} />
    </Shell>
  );
}
