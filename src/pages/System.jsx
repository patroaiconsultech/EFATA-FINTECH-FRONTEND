import React, { useCallback, useEffect, useState } from "react";
import { config } from "../config.js";
import { apiData, getTraceHistory } from "../lib/api.js";
import { Button, DataTable, ErrorNotice, JsonPreview, Loading, PageHeader, Panel, StatusBadge } from "../components/UI.jsx";

export default function System({ me }) {
  const [health, setHealth] = useState({ live: null, ready: null });
  const [traces, setTraces] = useState(getTraceHistory());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    setLoading(true); setError(null);
    const [live, ready] = await Promise.allSettled([apiData("/api/v1/health/live"), apiData("/api/v1/health/ready")]);
    setHealth({ live: live.status === "fulfilled" ? live.value : live.reason, ready: ready.status === "fulfilled" ? ready.value : ready.reason });
    setLoading(false);
  }, []);

  useEffect(() => {
    check();
    const onTrace = () => setTraces(getTraceHistory());
    window.addEventListener("efata:trace", onTrace);
    return () => window.removeEventListener("efata:trace", onTrace);
  }, [check]);

  return (
    <>
      <PageHeader eyebrow="Sistema" title="Saúde e observabilidade" description="Contexto atual, health checks e request tracing sem exposição de tokens ou secrets." actions={<Button variant="secondary" onClick={check}>Revalidar</Button>} />
      <ErrorNotice error={error} />
      <section className="metrics-grid">
        <div className="metric"><span>Live</span><strong>{loading ? "…" : health.live instanceof Error ? "FAIL" : "OK"}</strong></div>
        <div className="metric"><span>Ready</span><strong>{loading ? "…" : health.ready instanceof Error ? "FAIL" : "OK"}</strong></div>
        <div className="metric"><span>Role</span><strong className="metric-small">{me.role}</strong></div>
        <div className="metric"><span>Build</span><strong className="metric-small">{config.buildRef}</strong></div>
      </section>
      <div className="split-grid">
        <Panel title="Contexto canônico"><JsonPreview value={me} /></Panel>
        <Panel title="Configuração pública">
          <dl className="definition-grid">
            <div><dt>API</dt><dd>{config.apiBaseUrl}</dd></div>
            <div><dt>Auth mode</dt><dd>{config.authMode}</dd></div>
            <div><dt>Environment</dt><dd>{config.appEnv}</dd></div>
            <div><dt>Build ref</dt><dd>{config.buildRef}</dd></div>
          </dl>
        </Panel>
      </div>
      <Panel title="Últimas requisições" subtitle="Somente metadata de transporte; payloads sensíveis não são registrados.">
        <DataTable rows={traces} columns={[
          { key: "method", label: "Método" }, { key: "path", label: "Path" }, { key: "status", label: "Status" },
          { key: "durationMs", label: "ms" }, { key: "requestId", label: "Request ID" }, { key: "correlationId", label: "Correlation ID" },
        ]} />
      </Panel>
    </>
  );
}
