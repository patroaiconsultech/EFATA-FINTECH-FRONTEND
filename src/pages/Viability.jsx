import React, { useCallback, useEffect, useState } from "react";
import { apiData } from "../lib/api.js";
import { formatMoney, parseJson } from "../lib/format.js";
import { Button, CopyId, DataTable, ErrorNotice, Field, JsonPreview, JsonTextArea, Loading, Money, PageHeader, Panel, Select, StatusBadge, TextInput } from "../components/UI.jsx";

export function ViabilityStudies() {
  const [studies, setStudies] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [selected, setSelected] = useState("");
  const [form, setForm] = useState({ title: "", project_name: "", base_date: new Date().toISOString().slice(0,10), opportunity_id: "", inputs: "{}" });
  const [scenario, setScenario] = useState({ scenario_key: "BASE", name: "Base", overrides: "{}" });
  const [calc, setCalc] = useState(null);
  const [action, setAction] = useState({ study_id: "", scenario_key: "BASE", variable: "price", shocks: "-0.1,0,0.1" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setStudies(await apiData("/api/v1/viability/studies")); }
    catch (cause) { setError(cause); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function loadScenarios(id) {
    setSelected(id); setAction((a) => ({ ...a, study_id: id }));
    try { setScenarios(await apiData(`/api/v1/viability/studies/${id}/scenarios`)); }
    catch (cause) { setError(cause); }
  }

  async function createStudy(event) {
    event.preventDefault(); setError(null);
    try {
      await apiData("/api/v1/viability/studies", { method: "POST", body: {
        title: form.title, project_name: form.project_name, base_date: form.base_date,
        opportunity_id: form.opportunity_id || null, inputs: parseJson(form.inputs),
      }});
      setForm({ ...form, title: "", project_name: "" }); await load();
    } catch (cause) { setError(cause); }
  }

  async function createScenario(event) {
    event.preventDefault();
    try {
      await apiData(`/api/v1/viability/studies/${selected}/scenarios`, { method: "POST", body: { ...scenario, overrides: parseJson(scenario.overrides) } });
      await loadScenarios(selected);
    } catch (cause) { setError(cause); }
  }

  async function scenarioAction(kind) {
    setError(null); setCalc(null);
    try {
      const base = `/api/v1/viability/studies/${action.study_id}/scenarios/${action.scenario_key}/${kind}`;
      let body = {};
      if (kind === "sensitivity") body = { variable: action.variable, shocks: action.shocks.split(",").map(Number) };
      const result = await apiData(base, { method: "POST", body });
      setCalc(result);
      if (kind === "calculate") await loadScenarios(action.study_id);
    } catch (cause) { setError(cause); }
  }

  return (
    <>
      <PageHeader eyebrow="Viabilidade" title="Estudos e cenários" description="Cálculos críticos permanecem no backend; o frontend somente organiza premissas e renderiza resultados." />
      <ErrorNotice error={error} />
      <div className="split-grid">
        <Panel title="Novo estudo">
          <form className="form-stack" onSubmit={createStudy}>
            <Field label="Título"><TextInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Projeto"><TextInput required value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} /></Field>
            <div className="form-grid two">
              <Field label="Data base"><TextInput type="date" required value={form.base_date} onChange={(e) => setForm({ ...form, base_date: e.target.value })} /></Field>
              <Field label="Opportunity ID"><TextInput value={form.opportunity_id} onChange={(e) => setForm({ ...form, opportunity_id: e.target.value })} /></Field>
            </div>
            <Field label="Inputs (JSON)"><JsonTextArea value={form.inputs} onChange={(v) => setForm({ ...form, inputs: v })} rows={8} /></Field>
            <Button>Criar estudo</Button>
          </form>
        </Panel>
        <Panel title="Estudos existentes">
          {loading ? <Loading /> : <DataTable rows={studies} columns={[
            { key: "study_id", label: "ID", render: (r) => <button className="link-button" onClick={() => loadScenarios(r.study_id)}><CopyId value={r.study_id} /></button> },
            { key: "project_name", label: "Projeto" }, { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
            { key: "currency", label: "Moeda" },
          ]} />}
        </Panel>
      </div>

      {selected ? (
        <div className="split-grid">
          <Panel title="Cenários" subtitle={`Study ${selected}`}>
            <form className="form-stack" onSubmit={createScenario}>
              <div className="form-grid two">
                <Field label="Chave"><Select value={scenario.scenario_key} onChange={(e) => setScenario({ ...scenario, scenario_key: e.target.value })}><option>BASE</option><option>CONSERVATIVE</option><option>OPTIMISTIC</option><option>STRESS</option></Select></Field>
                <Field label="Nome"><TextInput required value={scenario.name} onChange={(e) => setScenario({ ...scenario, name: e.target.value })} /></Field>
              </div>
              <Field label="Overrides (JSON)"><JsonTextArea value={scenario.overrides} onChange={(v) => setScenario({ ...scenario, overrides: v })} /></Field>
              <Button>Criar cenário</Button>
            </form>
            <DataTable rows={scenarios} columns={[
              { key: "scenario_key", label: "Cenário" }, { key: "name", label: "Nome" }, { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
              { key: "engine_version", label: "Engine" },
            ]} />
          </Panel>

          <Panel title="Calcular / sensibilidade / snapshot">
            <div className="form-stack">
              <Field label="Study ID"><TextInput value={action.study_id} onChange={(e) => setAction({ ...action, study_id: e.target.value })} /></Field>
              <Field label="Scenario key"><Select value={action.scenario_key} onChange={(e) => setAction({ ...action, scenario_key: e.target.value })}><option>BASE</option><option>CONSERVATIVE</option><option>OPTIMISTIC</option><option>STRESS</option></Select></Field>
              <div className="button-row">
                <Button onClick={() => scenarioAction("calculate")}>Calcular</Button>
                <Button variant="secondary" onClick={() => scenarioAction("snapshot")}>Snapshot</Button>
              </div>
              <hr />
              <div className="form-grid two">
                <Field label="Variável"><Select value={action.variable} onChange={(e) => setAction({ ...action, variable: e.target.value })}><option>price</option><option>construction_cost</option><option>funding_rate</option><option>delay_months</option><option>absorption</option></Select></Field>
                <Field label="Shocks"><TextInput value={action.shocks} onChange={(e) => setAction({ ...action, shocks: e.target.value })} /></Field>
              </div>
              <Button variant="secondary" onClick={() => scenarioAction("sensitivity")}>Rodar sensibilidade</Button>
            </div>
            {calc ? <div className="result-block"><h3>Resultado</h3>{calc.flow?.length ? <DataTable rows={calc.flow.slice(0,24)} columns={[
              { key: "period_start", label: "Período" },
              { key: "revenue", label: "Receita", render: (r) => <Money value={r.revenue} /> },
              { key: "construction_cost", label: "Construção", render: (r) => <Money value={r.construction_cost} /> },
              { key: "net_cash_flow", label: "Fluxo líquido", render: (r) => <Money value={r.net_cash_flow} /> },
              { key: "debt_balance", label: "Dívida", render: (r) => <Money value={r.debt_balance} /> },
            ]} /> : <JsonPreview value={calc} />}</div> : null}
          </Panel>
        </div>
      ) : null}
    </>
  );
}

export function ErpConnections() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ provider: "SIENGE", external_tenant: "", base_url: "", scopes: "READ_ONLY", resource_map: "{}", secret: "" });
  const [sync, setSync] = useState({ connection_id: "", sync_job_id: "", study_id: "" });
  const [result, setResult] = useState(null);
  const [state, setState] = useState({ loading: true, error: null });

  const load = useCallback(async () => {
    setState({ loading: true, error: null });
    try { setRows(await apiData("/api/v1/viability/erp-connections")); setState({ loading: false, error: null }); }
    catch (error) { setState({ loading: false, error }); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create(event) {
    event.preventDefault(); setState((s) => ({ ...s, error: null }));
    try {
      await apiData("/api/v1/viability/erp-connections", { method: "POST", body: {
        provider: form.provider, external_tenant: form.external_tenant, base_url: form.base_url,
        scopes: form.scopes.split(",").map((x) => x.trim()).filter(Boolean),
        resource_map: parseJson(form.resource_map), secret: form.secret,
      }});
      setForm({ ...form, secret: "" }); await load();
    } catch (error) { setState((s) => ({ ...s, error })); }
  }

  async function act(kind) {
    setState((s) => ({ ...s, error: null })); setResult(null);
    try {
      let path;
      let body = {};
      if (kind === "sync") path = `/api/v1/viability/erp-connections/${sync.connection_id}/sync`;
      if (kind === "run") path = `/api/v1/viability/erp-connections/${sync.connection_id}/sync/run`;
      if (kind === "apply") { path = `/api/v1/viability/erp-sync-jobs/${sync.sync_job_id}/apply`; body = { confirm: true }; }
      const query = kind !== "apply" && sync.study_id ? { study_id: sync.study_id } : {};
      setResult(await apiData(path, { method: "POST", body, query }));
      await load();
    } catch (error) { setState((s) => ({ ...s, error })); }
  }

  return (
    <>
      <PageHeader eyebrow="Viabilidade" title="Conexões ERP" description="Integrações read-only. Secrets são enviados uma vez e nunca persistidos no browser." />
      <ErrorNotice error={state.error} />
      <div className="split-grid">
        <Panel title="Nova conexão">
          <form className="form-stack" onSubmit={create}>
            <div className="form-grid two">
              <Field label="Provider"><Select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}><option>SIENGE</option><option>MEGA</option></Select></Field>
              <Field label="Tenant externo"><TextInput required value={form.external_tenant} onChange={(e) => setForm({ ...form, external_tenant: e.target.value })} /></Field>
            </div>
            <Field label="Base URL"><TextInput type="url" required value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })} /></Field>
            <Field label="Scopes"><TextInput value={form.scopes} onChange={(e) => setForm({ ...form, scopes: e.target.value })} /></Field>
            <Field label="Resource map (JSON)"><JsonTextArea value={form.resource_map} onChange={(v) => setForm({ ...form, resource_map: v })} /></Field>
            <Field label="Secret"><TextInput type="password" autoComplete="off" required minLength={8} value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })} /></Field>
            <Button>Criar conexão</Button>
          </form>
        </Panel>
        <Panel title="Conexões">
          {state.loading ? <Loading /> : <DataTable rows={rows} columns={[
            { key: "connection_id", label: "ID", render: (r) => <CopyId value={r.connection_id} /> },
            { key: "provider", label: "Provider" }, { key: "external_tenant", label: "Tenant" },
            { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
            { key: "last_sync_at", label: "Último sync" },
          ]} />}
        </Panel>
      </div>
      <Panel title="Sincronização">
        <div className="form-stack">
          <div className="form-grid three">
            <Field label="Connection ID"><TextInput value={sync.connection_id} onChange={(e) => setSync({ ...sync, connection_id: e.target.value })} /></Field>
            <Field label="Study ID (opcional)"><TextInput value={sync.study_id} onChange={(e) => setSync({ ...sync, study_id: e.target.value })} /></Field>
            <Field label="Sync job ID"><TextInput value={sync.sync_job_id} onChange={(e) => setSync({ ...sync, sync_job_id: e.target.value })} /></Field>
          </div>
          <div className="button-row">
            <Button onClick={() => act("sync")}>Solicitar sync</Button>
            <Button variant="secondary" onClick={() => act("run")}>Executar sync</Button>
            <Button variant="danger" onClick={() => window.confirm("Aplicar resultado do sync ao estudo?") && act("apply")}>Aplicar sync</Button>
          </div>
        </div>
        {result ? <JsonPreview value={result} /> : null}
      </Panel>
    </>
  );
}
