import React, { useEffect, useMemo, useState } from "react";
import { isInternal } from "../config.js";
import { apiData } from "../lib/api.js";
import { formatMoney } from "../lib/format.js";
import { navigate } from "../lib/navigation.js";
import AgentCard from "../components/AgentCard.jsx";
import { Button, ErrorNotice, Loading, Metric, PageHeader, Panel, StatusBadge } from "../components/UI.jsx";

function settledCount(result) {
  return result?.status === "fulfilled" && Array.isArray(result.value) ? result.value.length : null;
}

export default function Dashboard({ me }) {
  const [state, setState] = useState({ loading: true, results: [], error: null });

  useEffect(() => {
    let active = true;
    const requests = isInternal(me.role)
      ? [
          ["Governança", "/api/v1/risk/governance-queue"],
          ["Matches", "/api/v1/marketplace/matches"],
          ["Viabilidade", "/api/v1/viability/studies"],
          ["Agentes", "/api/v1/marketplace/agents"],
        ]
      : [
          ["Leads", "/api/v1/leads"],
          ["Oportunidades", "/api/v1/opportunities"],
          ["Demandas", "/api/v1/marketplace/credit-requests"],
          ["Viabilidade", "/api/v1/viability/studies"],
        ];

    Promise.allSettled(requests.map(([, path]) => apiData(path))).then((results) => {
      if (!active) return;
      setState({ loading: false, results: results.map((result, i) => ({ label: requests[i][0], ...result })), error: null });
    });
    return () => { active = false; };
  }, [me.role, me.tenant_id]);

  const agents = useMemo(() => {
    const result = state.results.find((item) => item.label === "Agentes");
    return result?.status === "fulfilled" ? result.value : [];
  }, [state.results]);

  const errors = state.results.filter((result) => result.status === "rejected");

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title={`Olá, ${me.role}`}
        description="Indicadores derivados apenas de endpoints disponíveis para seu contexto. Nenhum número é fabricado pelo frontend."
        actions={<Button variant="secondary" onClick={() => navigate("/app/system")}>Diagnóstico</Button>}
      />

      {state.loading ? <Loading /> : (
        <>
          <section className="metrics-grid">
            {state.results.filter((item) => item.label !== "Agentes").map((item) => (
              <Metric key={item.label} label={item.label} value={item.status === "fulfilled" ? settledCount(item) ?? "—" : "—"} note={item.status === "rejected" ? "Indisponível para este contexto" : "Dados do backend"} />
            ))}
          </section>

          {errors.length ? (
            <Panel title="Dados parciais" subtitle="Alguns módulos responderam com erro ou não são permitidos à role atual.">
              <div className="stack">
                {errors.map((item) => <ErrorNotice key={item.label} error={item.reason} />)}
              </div>
            </Panel>
          ) : null}

          {agents.length ? (
            <Panel title="Agentes operacionais" subtitle="Catálogo governado pelo backend; autonomia não implica decisão final automática.">
              <div className="agents-grid">{agents.slice(0, 6).map((agent) => <AgentCard key={agent.key} agent={agent} />)}</div>
            </Panel>
          ) : null}

          <section className="dashboard-shortcuts">
            <button onClick={() => navigate("/app/marketplace/credit-requests")}><strong>Demandas de crédito</strong><span>Estruture o pedido e acompanhe matching.</span></button>
            <button onClick={() => navigate("/app/risk/simulator")}><strong>Simulação de risco</strong><span>Triagem assistida com evidências e gaps.</span></button>
            <button onClick={() => navigate("/app/viability/studies")}><strong>Viabilidade</strong><span>Cenários, fluxo, sensibilidade e snapshots.</span></button>
            {isInternal(me.role) ? <button onClick={() => navigate("/app/reconciliation/reviews")}><strong>Pós-fechamento</strong><span>Reviews, settlement e outbox.</span></button> : null}
          </section>
        </>
      )}
    </>
  );
}
