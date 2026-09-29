import React, { useCallback, useEffect, useState } from "react";
import { apiData } from "../lib/api.js";
import { parseJson } from "../lib/format.js";
import { Button, CopyId, DataTable, ErrorNotice, Field, JsonPreview, JsonTextArea, Loading, Money, PageHeader, Panel, Select, StatusBadge, TextArea, TextInput } from "../components/UI.jsx";

export default function Reconciliation({ section = "reviews" }) {
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  return (
    <>
      <PageHeader eyebrow="Pós-fechamento" title="Reconciliação persistente" description="Interface operacional usa a superfície persistente do backend sempre que disponível." />
      <ErrorNotice error={error} />
      {section === "commissions" ? <CommissionPanel onError={setError} onResult={setResult} /> : null}
      {section === "settlements" ? <SettlementPanel onError={setError} onResult={setResult} /> : null}
      {section === "reviews" ? <ReviewsPanel onError={setError} /> : null}
      {section === "outbox" ? <OutboxPanel onError={setError} onResult={setResult} /> : null}
      {result ? <Panel title="Última resposta"><JsonPreview value={result} /></Panel> : null}
    </>
  );
}

function CommissionPanel({ onError, onResult }) {
  const [form, setForm] = useState({ match_id: "", beneficiary_tenant_id: "", trigger_event: "CONTRACT_SIGNED", base_amount: "", rate_bps: "0", currency: "BRL", contract_id: "" });
  const [transition, setTransition] = useState({ commission_id: "", status: "CONTRACTED", contract_id: "", metadata: "{}" });

  async function create(e) {
    e.preventDefault(); onError(null);
    try {
      onResult(await apiData("/api/v1/reconciliation/persistent/commissions", { method: "POST", body: {
        ...form, base_amount: Number(form.base_amount), rate_bps: Number(form.rate_bps), contract_id: form.contract_id || null,
      }}));
    } catch (error) { onError(error); }
  }
  async function move(e) {
    e.preventDefault(); onError(null);
    try {
      onResult(await apiData(`/api/v1/reconciliation/persistent/commissions/${transition.commission_id}/transition`, { method: "POST", body: {
        status: transition.status, contract_id: transition.contract_id || null, metadata: parseJson(transition.metadata),
      }}));
    } catch (error) { onError(error); }
  }

  return <div className="split-grid">
    <Panel title="Registrar comissão">
      <form className="form-stack" onSubmit={create}>
        <Field label="Match ID"><TextInput required value={form.match_id} onChange={(e) => setForm({ ...form, match_id: e.target.value })} /></Field>
        <Field label="Tenant beneficiário"><TextInput required value={form.beneficiary_tenant_id} onChange={(e) => setForm({ ...form, beneficiary_tenant_id: e.target.value })} /></Field>
        <div className="form-grid two">
          <Field label="Trigger event"><TextInput required value={form.trigger_event} onChange={(e) => setForm({ ...form, trigger_event: e.target.value })} /></Field>
          <Field label="Contract ID"><TextInput value={form.contract_id} onChange={(e) => setForm({ ...form, contract_id: e.target.value })} /></Field>
          <Field label="Base amount"><TextInput type="number" required value={form.base_amount} onChange={(e) => setForm({ ...form, base_amount: e.target.value })} /></Field>
          <Field label="Rate bps"><TextInput type="number" min="0" max="10000" value={form.rate_bps} onChange={(e) => setForm({ ...form, rate_bps: e.target.value })} /></Field>
        </div>
        <Button>Registrar</Button>
      </form>
    </Panel>
    <Panel title="Transicionar comissão">
      <form className="form-stack" onSubmit={move}>
        <Field label="Commission ID"><TextInput required value={transition.commission_id} onChange={(e) => setTransition({ ...transition, commission_id: e.target.value })} /></Field>
        <Field label="Status"><TextInput required value={transition.status} onChange={(e) => setTransition({ ...transition, status: e.target.value })} /></Field>
        <Field label="Contract ID"><TextInput value={transition.contract_id} onChange={(e) => setTransition({ ...transition, contract_id: e.target.value })} /></Field>
        <Field label="Metadata"><JsonTextArea value={transition.metadata} onChange={(v) => setTransition({ ...transition, metadata: v })} /></Field>
        <Button variant="secondary">Transicionar</Button>
      </form>
    </Panel>
  </div>;
}

function SettlementPanel({ onError, onResult }) {
  const [form, setForm] = useState({
    external_event_id: "", beneficiary_tenant_id: "", amount: "", currency: "BRL",
    settled_at: "", contract_id: "", match_id: "", invoice_reference: "", account_fingerprint: "",
    source: "BANK_SETTLEMENT_FEED", metadata: "{}",
  });
  async function submit(e) {
    e.preventDefault(); onError(null);
    try {
      onResult(await apiData("/api/v1/reconciliation/persistent/settlements", { method: "POST", body: {
        ...form, amount: Number(form.amount), settled_at: new Date(form.settled_at).toISOString(),
        contract_id: form.contract_id || null, match_id: form.match_id || null,
        invoice_reference: form.invoice_reference || null, account_fingerprint: form.account_fingerprint || null,
        metadata: parseJson(form.metadata),
      }}));
    } catch (error) { onError(error); }
  }
  return <Panel title="Ingerir settlement">
    <form className="form-stack" onSubmit={submit}>
      <div className="form-grid two">
        <Field label="External event ID"><TextInput required value={form.external_event_id} onChange={(e) => setForm({ ...form, external_event_id: e.target.value })} /></Field>
        <Field label="Beneficiary tenant"><TextInput required value={form.beneficiary_tenant_id} onChange={(e) => setForm({ ...form, beneficiary_tenant_id: e.target.value })} /></Field>
        <Field label="Amount"><TextInput type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
        <Field label="Settled at"><TextInput type="datetime-local" required value={form.settled_at} onChange={(e) => setForm({ ...form, settled_at: e.target.value })} /></Field>
        <Field label="Contract ID"><TextInput value={form.contract_id} onChange={(e) => setForm({ ...form, contract_id: e.target.value })} /></Field>
        <Field label="Match ID"><TextInput value={form.match_id} onChange={(e) => setForm({ ...form, match_id: e.target.value })} /></Field>
        <Field label="Invoice reference"><TextInput value={form.invoice_reference} onChange={(e) => setForm({ ...form, invoice_reference: e.target.value })} /></Field>
        <Field label="Account fingerprint"><TextInput value={form.account_fingerprint} onChange={(e) => setForm({ ...form, account_fingerprint: e.target.value })} /></Field>
      </div>
      <Field label="Metadata (JSON)"><JsonTextArea value={form.metadata} onChange={(v) => setForm({ ...form, metadata: v })} /></Field>
      <Button>Reconciliar settlement</Button>
    </form>
  </Panel>;
}

function ReviewsPanel({ onError }) {
  const [rows, setRows] = useState([]);
  const [claimTo, setClaimTo] = useState("");
  const [resolve, setResolve] = useState({ review_id: "", decision: "RESOLVED", notes: "" });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); onError(null);
    try { setRows(await apiData("/api/v1/reconciliation/persistent/reviews")); }
    catch (error) { onError(error); }
    finally { setLoading(false); }
  }, [onError]);
  useEffect(() => { load(); }, [load]);

  async function claim() {
    onError(null);
    try { await apiData("/api/v1/reconciliation/persistent/reviews/claim", { method: "POST", body: { assigned_to: claimTo || null } }); await load(); }
    catch (error) { onError(error); }
  }
  async function finish(e) {
    e.preventDefault(); onError(null);
    try { await apiData(`/api/v1/reconciliation/persistent/reviews/${resolve.review_id}/resolve`, { method: "POST", body: { decision: resolve.decision, notes: resolve.notes } }); await load(); }
    catch (error) { onError(error); }
  }

  return <>
    <Panel title="Review queue" actions="">
      {loading ? <Loading /> : <DataTable rows={rows} columns={[
        { key: "review_id", label: "ID", render: (r) => <CopyId value={r.review_id} /> },
        { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
        { key: "reason", label: "Motivo" }, { key: "received_amount", label: "Recebido", render: (r) => <Money value={r.received_amount} currency={r.currency} /> },
        { key: "assigned_to", label: "Responsável", render: (r) => <CopyId value={r.assigned_to} /> },
      ]} />}
    </Panel>
    <div className="split-grid">
      <Panel title="Claim reviews"><div className="form-inline"><TextInput value={claimTo} onChange={(e) => setClaimTo(e.target.value)} placeholder="assigned_to (vazio = eu)" /><Button onClick={claim}>Claim</Button></div></Panel>
      <Panel title="Resolver review">
        <form className="form-stack" onSubmit={finish}>
          <Field label="Review ID"><TextInput required value={resolve.review_id} onChange={(e) => setResolve({ ...resolve, review_id: e.target.value })} /></Field>
          <Field label="Decision"><TextInput required value={resolve.decision} onChange={(e) => setResolve({ ...resolve, decision: e.target.value })} /></Field>
          <Field label="Notas"><TextArea required minLength={3} value={resolve.notes} onChange={(e) => setResolve({ ...resolve, notes: e.target.value })} /></Field>
          <Button>Resolver</Button>
        </form>
      </Panel>
    </div>
  </>;
}

function OutboxPanel({ onError, onResult }) {
  const [metrics, setMetrics] = useState(null);
  const [claimed, setClaimed] = useState([]);
  const [ack, setAck] = useState({ outbox_id: "", published: "true", error: "" });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); onError(null);
    try { setMetrics(await apiData("/api/v1/reconciliation/persistent/outbox/metrics")); }
    catch (error) { onError(error); }
    finally { setLoading(false); }
  }, [onError]);
  useEffect(() => { load(); }, [load]);

  async function claim() {
    try { setClaimed(await apiData("/api/v1/reconciliation/persistent/outbox/claim", { method: "POST" })); await load(); }
    catch (error) { onError(error); }
  }

  async function acknowledge(e) {
    e.preventDefault();
    try {
      const data = await apiData(`/api/v1/reconciliation/persistent/outbox/${ack.outbox_id}/ack`, {
        method: "POST",
        query: { published: ack.published === "true", error: ack.error || undefined },
      });
      onResult(data); await load();
    } catch (error) { onError(error); }
  }

  return <>
    <section className="metrics-grid">
      <div className="metric"><span>Pending</span><strong>{metrics?.pending_count ?? "—"}</strong></div>
      <div className="metric"><span>Processing</span><strong>{metrics?.processing_count ?? "—"}</strong></div>
      <div className="metric"><span>Dead letter</span><strong>{metrics?.dead_letter_count ?? "—"}</strong></div>
      <div className="metric"><span>Retries</span><strong>{metrics?.retry_total ?? "—"}</strong></div>
    </section>
    <Panel title="Outbox operacional">
      {loading ? <Loading /> : metrics?.alerts?.length ? <ul className="alert-list">{metrics.alerts.map((a) => <li key={a}>{a}</li>)}</ul> : <p className="muted">Sem alertas reportados no snapshot.</p>}
      <Button onClick={claim}>Claim disponíveis</Button>
      {claimed.length ? <DataTable rows={claimed} columns={[
        { key: "outbox_id", label: "ID", render: (r) => <CopyId value={r.outbox_id} /> },
        { key: "event_type", label: "Evento" }, { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
        { key: "attempt_count", label: "Tentativas" },
      ]} /> : null}
    </Panel>
    <Panel title="ACK">
      <form className="form-stack" onSubmit={acknowledge}>
        <Field label="Outbox ID"><TextInput required value={ack.outbox_id} onChange={(e) => setAck({ ...ack, outbox_id: e.target.value })} /></Field>
        <Field label="Publicado?"><Select value={ack.published} onChange={(e) => setAck({ ...ack, published: e.target.value })}><option value="true">Sim</option><option value="false">Não</option></Select></Field>
        <Field label="Erro (quando falhou)"><TextArea value={ack.error} onChange={(e) => setAck({ ...ack, error: e.target.value })} /></Field>
        <Button variant="secondary">Confirmar ACK</Button>
      </form>
    </Panel>
  </>;
}
