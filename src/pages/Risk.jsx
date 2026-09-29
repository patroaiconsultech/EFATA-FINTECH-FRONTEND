import React, { useCallback, useEffect, useState } from "react";
import { apiData } from "../lib/api.js";
import { toTags } from "../lib/format.js";
import { Button, CopyId, DataTable, ErrorNotice, Field, JsonPreview, Loading, PageHeader, Panel, Select, StatusBadge, TextArea, TextInput } from "../components/UI.jsx";

export function RiskSimulator() {
  const [form, setForm] = useState({
    credit_request_id: "", consent_status: "GRANTED", requested_amount: "5000000", currency: "BRL",
    term_months: "36", project_stage: "STRUCTURED", purpose: "Financiamento da construção e comercialização.",
    collateral_types: "RECEIVABLES", sectors: "REAL_ESTATE", regions: "SP",
    document_types: "CORPORATE_DOCUMENTS,FINANCIAL_STATEMENTS",
    revenue_monthly: "", debt_service_monthly: "", ebitda_annual: "", total_debt: "", collateral_value: "",
    dscr: "", ltv: "", financial_data_confidence: "MISSING",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function optionalNumber(value) { return value === "" ? null : Number(value); }

  async function simulate(event) {
    event.preventDefault(); setLoading(true); setError(null); setResult(null);
    try {
      const body = {
        credit_request_id: form.credit_request_id || null,
        consent_status: form.consent_status,
        requested_amount: Number(form.requested_amount),
        currency: form.currency,
        term_months: Number(form.term_months),
        project_stage: form.project_stage,
        purpose: form.purpose,
        collateral_types: toTags(form.collateral_types),
        sectors: toTags(form.sectors),
        regions: toTags(form.regions),
        document_types: toTags(form.document_types),
        revenue_monthly: optionalNumber(form.revenue_monthly),
        debt_service_monthly: optionalNumber(form.debt_service_monthly),
        ebitda_annual: optionalNumber(form.ebitda_annual),
        total_debt: optionalNumber(form.total_debt),
        collateral_value: optionalNumber(form.collateral_value),
        dscr: optionalNumber(form.dscr),
        ltv: optionalNumber(form.ltv),
        financial_data_confidence: form.financial_data_confidence,
      };
      setResult(await apiData("/api/v1/risk/simulate", { method: "POST", body }));
    } catch (cause) { setError(cause); }
    finally { setLoading(false); }
  }

  return (
    <>
      <PageHeader eyebrow="Risco" title="Simulador de triagem" description="Score interno de preparação e governança; não representa aprovação automática de crédito." />
      <ErrorNotice error={error} />
      <div className="split-grid risk-layout">
        <Panel title="Premissas">
          <form className="form-stack" onSubmit={simulate}>
            <Field label="Credit request ID (opcional)"><TextInput value={form.credit_request_id} onChange={(e) => setForm({ ...form, credit_request_id: e.target.value })} /></Field>
            <div className="form-grid two">
              <Field label="Valor solicitado"><TextInput type="number" required value={form.requested_amount} onChange={(e) => setForm({ ...form, requested_amount: e.target.value })} /></Field>
              <Field label="Prazo (meses)"><TextInput type="number" required value={form.term_months} onChange={(e) => setForm({ ...form, term_months: e.target.value })} /></Field>
              <Field label="Consentimento"><Select value={form.consent_status} onChange={(e) => setForm({ ...form, consent_status: e.target.value })}><option>PENDING</option><option>GRANTED</option><option>REVOKED</option></Select></Field>
              <Field label="Confiança financeira"><Select value={form.financial_data_confidence} onChange={(e) => setForm({ ...form, financial_data_confidence: e.target.value })}><option>HIGH</option><option>MEDIUM</option><option>LOW</option><option>MISSING</option></Select></Field>
            </div>
            <Field label="Estágio"><TextInput required value={form.project_stage} onChange={(e) => setForm({ ...form, project_stage: e.target.value })} /></Field>
            <Field label="Finalidade"><TextArea required value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></Field>
            <Field label="Garantias"><TextInput value={form.collateral_types} onChange={(e) => setForm({ ...form, collateral_types: e.target.value })} /></Field>
            <Field label="Setores"><TextInput value={form.sectors} onChange={(e) => setForm({ ...form, sectors: e.target.value })} /></Field>
            <Field label="Regiões"><TextInput value={form.regions} onChange={(e) => setForm({ ...form, regions: e.target.value })} /></Field>
            <Field label="Documentos"><TextInput value={form.document_types} onChange={(e) => setForm({ ...form, document_types: e.target.value })} /></Field>
            <div className="form-grid two">
              {[
                ["revenue_monthly","Receita mensal"],["debt_service_monthly","Serviço da dívida/mês"],
                ["ebitda_annual","EBITDA anual"],["total_debt","Dívida total"],
                ["collateral_value","Valor da garantia"],["dscr","DSCR"],
                ["ltv","LTV"],
              ].map(([key,label]) => <Field key={key} label={label}><TextInput type="number" step="0.0001" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></Field>)}
            </div>
            <Button disabled={loading}>{loading ? "Simulando…" : "Executar simulação"}</Button>
          </form>
        </Panel>
        <Panel title="Resultado" subtitle="Valores retornados integralmente pelo backend.">
          {loading ? <Loading /> : result ? (
            <div className="result-stack">
              <div className="score-card">
                <span>Score</span><strong>{result.score}</strong><StatusBadge value={result.risk_band} />
              </div>
              <dl className="definition-grid">
                <div><dt>Decisão</dt><dd>{result.decision}</dd></div>
                <div><dt>Status humano</dt><dd>{result.human_status}</dd></div>
                <div className="wide"><dt>Recomendação</dt><dd>{result.recommendation}</dd></div>
              </dl>
              {result.missing_data?.length ? <div><h3>Dados ausentes</h3><ul>{result.missing_data.map((x) => <li key={x}>{x}</li>)}</ul></div> : null}
              {result.rule_results?.length ? <DataTable rows={result.rule_results} columns={[
                { key: "label", label: "Regra" }, { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
                { key: "score_contribution", label: "Contribuição" }, { key: "explanation", label: "Explicação" },
              ]} /> : null}
            </div>
          ) : <p className="muted">Execute uma simulação para visualizar score, evidências, gaps e recomendação.</p>}
        </Panel>
      </div>
    </>
  );
}

export function GovernanceQueue() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ match_id: "", assessment_id: "", decision: "APPROVE_CONTACT", reason: "", visibility: "INTERNAL" });
  const [state, setState] = useState({ loading: true, error: null });

  const load = useCallback(async () => {
    setState({ loading: true, error: null });
    try { setRows(await apiData("/api/v1/risk/governance-queue")); setState({ loading: false, error: null }); }
    catch (error) { setState({ loading: false, error }); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function review(event) {
    event.preventDefault(); setState((s) => ({ ...s, error: null }));
    try {
      await apiData(`/api/v1/risk/matches/${form.match_id}/governance-reviews`, {
        method: "POST",
        body: { assessment_id: form.assessment_id || null, decision: form.decision, reason: form.reason, visibility: form.visibility },
      });
      setForm({ ...form, reason: "" }); await load();
    } catch (error) { setState((s) => ({ ...s, error })); }
  }

  return (
    <>
      <PageHeader eyebrow="Risco" title="Fila de governança" description="Decisões humanas persistidas sobre matches e avaliações de risco." />
      <ErrorNotice error={state.error} />
      <Panel title="Fila atual">
        {state.loading ? <Loading /> : <DataTable rows={rows} columns={[
          { key: "match_id", label: "Match", render: (r) => <CopyId value={r.match_id} /> },
          { key: "credit_request_id", label: "Demanda", render: (r) => <CopyId value={r.credit_request_id} /> },
          { key: "score", label: "Score" },
          { key: "match_status", label: "Match", render: (r) => <StatusBadge value={r.match_status} /> },
          { key: "requires_human_decision", label: "Revisão humana", render: (r) => r.requires_human_decision ? "Sim" : "Não" },
          { key: "risk_assessment", label: "Risco", render: (r) => r.risk_assessment ? `${r.risk_assessment.risk_band} · ${r.risk_assessment.score}` : "—" },
        ]} />}
      </Panel>
      <Panel title="Registrar revisão humana">
        <form className="form-stack" onSubmit={review}>
          <div className="form-grid two">
            <Field label="Match ID"><TextInput required value={form.match_id} onChange={(e) => setForm({ ...form, match_id: e.target.value })} /></Field>
            <Field label="Assessment ID (opcional)"><TextInput value={form.assessment_id} onChange={(e) => setForm({ ...form, assessment_id: e.target.value })} /></Field>
            <Field label="Decisão"><Select value={form.decision} onChange={(e) => setForm({ ...form, decision: e.target.value })}><option>APPROVE_CONTACT</option><option>REQUEST_INFORMATION</option><option>BLOCK</option><option>REJECT</option></Select></Field>
            <Field label="Visibilidade"><Select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}><option>INTERNAL</option><option>BORROWER</option><option>FUNDER</option><option>PARTNER</option></Select></Field>
          </div>
          <Field label="Justificativa"><TextArea required minLength={5} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field>
          <Button>Registrar decisão</Button>
        </form>
      </Panel>
    </>
  );
}
